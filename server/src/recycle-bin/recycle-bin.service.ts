import {
  ForbiddenException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { BLOB_STORE, type BlobStore } from '../storage/blob-store.interface';
import {
  DELETION_RETENTION_DAYS,
  getDaysRemaining,
  getPurgeCutoff,
  toActiveStorageKey,
  toDeletedStorageKey,
} from '../common/deletion.constants';

export interface DeletedDocumentSummary {
  id: string;
  originalFilename: string;
  mimeType: string;
  sizeBytes: number;
  projectId: string;
  projectName: string;
  deletedAt: Date;
  deletedByEmail: string | null;
  deletedByName: string | null;
  daysRemaining: number;
  retentionDays: number;
}

@Injectable()
export class RecycleBinService {
  private readonly logger = new Logger(RecycleBinService.name);

  constructor(
    private readonly prisma: PrismaService,
    @Inject(BLOB_STORE) private readonly blobStore: BlobStore,
  ) {}

  /**
   * List every soft-deleted document with its deletion context — admin only.
   */
  async listDeletedDocuments(
    userId: string,
  ): Promise<DeletedDocumentSummary[]> {
    await this.assertAdmin(userId);

    const documents = await this.prisma.document.findMany({
      where: { deletedAt: { not: null } },
      orderBy: { deletedAt: 'desc' },
      select: {
        id: true,
        originalFilename: true,
        mimeType: true,
        sizeBytes: true,
        deletedAt: true,
        projectId: true,
        project: { select: { name: true } },
      },
    });

    if (documents.length === 0) {
      return [];
    }

    // The most recent open log row per document tells us who deleted it.
    const logs = await this.prisma.deletionLog.findMany({
      where: {
        documentId: { in: documents.map((doc) => doc.id) },
        restoredAt: null,
        permanentlyDeletedAt: null,
      },
      orderBy: { deletedAt: 'desc' },
      select: {
        documentId: true,
        actorEmail: true,
        actor: { select: { fullName: true } },
      },
    });

    const logByDocumentId = new Map<string, (typeof logs)[number]>();
    for (const log of logs) {
      if (!logByDocumentId.has(log.documentId)) {
        logByDocumentId.set(log.documentId, log);
      }
    }

    const now = new Date();

    return documents.map((doc) => {
      const log = logByDocumentId.get(doc.id);
      const deletedAt = doc.deletedAt as Date;

      return {
        id: doc.id,
        originalFilename: doc.originalFilename,
        mimeType: doc.mimeType,
        sizeBytes: doc.sizeBytes,
        projectId: doc.projectId,
        projectName: doc.project.name,
        deletedAt,
        deletedByEmail: log?.actorEmail ?? null,
        deletedByName: log?.actor?.fullName ?? null,
        daysRemaining: getDaysRemaining(deletedAt, now),
        retentionDays: DELETION_RETENTION_DAYS,
      };
    });
  }

  /**
   * Restore a soft-deleted document: clear `deletedAt`, close the log row and move
   * the file back out of the deleted area — admin only.
   */
  async restoreDocument(
    documentId: string,
    userId: string,
  ): Promise<{ id: string }> {
    await this.assertAdmin(userId);

    const document = await this.prisma.document.findFirst({
      where: { id: documentId, deletedAt: { not: null } },
      select: { id: true, storageKey: true },
    });

    if (!document) {
      throw new NotFoundException('Deleted document not found');
    }

    const log = await this.prisma.deletionLog.findFirst({
      where: {
        documentId,
        restoredAt: null,
        permanentlyDeletedAt: null,
      },
      orderBy: { deletedAt: 'desc' },
      select: { id: true, storageKey: true },
    });

    const restoredStorageKey = toActiveStorageKey(
      log?.storageKey || document.storageKey,
    );
    const restoredAt = new Date();

    // Claim the row first so a concurrent purge cannot delete the document (and its file)
    // out from under the restore. Nothing is moved unless this update wins.
    const claimed = await this.prisma.document.updateMany({
      where: { id: documentId, deletedAt: { not: null } },
      data: { deletedAt: null, storageKey: restoredStorageKey },
    });

    if (claimed.count === 0) {
      throw new NotFoundException('Deleted document not found');
    }

    if (document.storageKey && restoredStorageKey !== document.storageKey) {
      try {
        await this.blobStore.moveFile(document.storageKey, restoredStorageKey);
      } catch (error) {
        this.logger.warn(
          `Could not move file for document ${documentId} back from the deleted area: ${String(error)}`,
        );
      }
    }

    await this.prisma.deletionLog.updateMany({
      where: { documentId, restoredAt: null, permanentlyDeletedAt: null },
      data: { restoredAt },
    });

    return { id: documentId };
  }

  /**
   * Permanently delete a soft-deleted document ahead of the retention window — admin only.
   */
  async permanentlyDeleteDocument(
    documentId: string,
    userId: string,
  ): Promise<{ id: string }> {
    await this.assertAdmin(userId);

    const document = await this.prisma.document.findFirst({
      where: { id: documentId, deletedAt: { not: null } },
      select: { id: true, storageKey: true },
    });

    if (!document) {
      throw new NotFoundException('Deleted document not found');
    }

    await this.purgeDocument(document.id, document.storageKey);

    return { id: documentId };
  }

  /**
   * Permanently delete every document whose retention window has expired.
   * Safe to run repeatedly and concurrently: each document is claimed with a
   * conditional delete, and a missing file is never fatal.
   */
  async purgeExpiredDocuments(
    now: Date = new Date(),
  ): Promise<{ purged: number }> {
    const cutoff = getPurgeCutoff(now);

    const expired = await this.prisma.document.findMany({
      where: { deletedAt: { not: null, lt: cutoff } },
      select: { id: true, storageKey: true },
    });

    let purged = 0;

    for (const document of expired) {
      try {
        const removed = await this.purgeDocument(
          document.id,
          document.storageKey,
          cutoff,
        );
        if (removed) {
          purged += 1;
        }
      } catch (error) {
        // One bad document must not stop the rest of the sweep.
        this.logger.error(
          `Failed to permanently delete document ${document.id}: ${String(error)}`,
        );
      }
    }

    return { purged };
  }

  /**
   * Unlink the file and delete the Document row, leaving the DeletionLog row in place
   * with `permanentlyDeletedAt` set. Returns false if another run got there first.
   */
  private async purgeDocument(
    documentId: string,
    storageKey: string,
    cutoff?: Date,
  ): Promise<boolean> {
    // Claim the row first: if a concurrent restore (or another purge) got there first,
    // deleteMany matches nothing and the file is left untouched.
    const claimed = await this.prisma.document.deleteMany({
      where: {
        id: documentId,
        deletedAt: cutoff ? { not: null, lt: cutoff } : { not: null },
      },
    });

    if (claimed.count === 0) {
      return false;
    }

    // Files are only ever unlinked from the deleted holding area.
    const deletedStorageKey = storageKey ? toDeletedStorageKey(storageKey) : '';

    if (deletedStorageKey) {
      try {
        // deleteFile already ignores a missing file.
        await this.blobStore.deleteFile(deletedStorageKey);
      } catch (error) {
        this.logger.warn(
          `Could not delete file for document ${documentId}: ${String(error)}`,
        );
      }
    }

    // Only the log row for the deletion being purged is closed — earlier rows that were
    // restored keep their `restoredAt` and stay untouched.
    await this.prisma.deletionLog.updateMany({
      where: { documentId, restoredAt: null, permanentlyDeletedAt: null },
      data: { permanentlyDeletedAt: new Date() },
    });

    return true;
  }

  private async assertAdmin(userId: string): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Only admins can access the recycle bin');
    }
  }
}
