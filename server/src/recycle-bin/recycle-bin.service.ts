import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, UserRole } from '@prisma/client';
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

export interface DeletedProjectSummary {
  id: string;
  name: string;
  deletedAt: Date;
  deletedByEmail: string | null;
  deletedByName: string | null;
  documentCount: number;
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
   * List soft-deleted documents whose project is still active — admin only.
   * Documents belonging to a deleted project are reached instead by drilling into that
   * project via `listDeletedProjectDocuments`.
   */
  async listDeletedDocuments(
    userId: string,
  ): Promise<DeletedDocumentSummary[]> {
    await this.assertAdmin(userId);

    return this.getDeletedDocumentSummaries({
      deletedAt: { not: null },
      project: { deletedAt: null },
    });
  }

  /**
   * List every soft-deleted document within a specific deleted project — admin only.
   */
  async listDeletedProjectDocuments(
    userId: string,
    projectId: string,
  ): Promise<DeletedDocumentSummary[]> {
    await this.assertAdmin(userId);

    const project = await this.prisma.project.findFirst({
      where: { id: projectId, deletedAt: { not: null } },
      select: { id: true },
    });

    if (!project) {
      throw new NotFoundException('Deleted project not found');
    }

    return this.getDeletedDocumentSummaries({
      projectId,
      deletedAt: { not: null },
    });
  }

  /**
   * List every soft-deleted project with its deletion context — admin only.
   */
  async listDeletedProjects(userId: string): Promise<DeletedProjectSummary[]> {
    await this.assertAdmin(userId);

    const projects = await this.prisma.project.findMany({
      where: { deletedAt: { not: null } },
      orderBy: { deletedAt: 'desc' },
      select: {
        id: true,
        name: true,
        deletedAt: true,
        deletedByEmail: true,
        deletedBy: { select: { fullName: true } },
        _count: { select: { documents: true } },
      },
    });

    const now = new Date();

    return projects.map((project) => {
      const deletedAt = project.deletedAt as Date;

      return {
        id: project.id,
        name: project.name,
        deletedAt,
        deletedByEmail: project.deletedByEmail,
        deletedByName: project.deletedBy?.fullName ?? null,
        documentCount: project._count.documents,
        daysRemaining: getDaysRemaining(deletedAt, now),
        retentionDays: DELETION_RETENTION_DAYS,
      };
    });
  }

  /**
   * Shared document -> summary mapping used by both the flat recycle bin list and the
   * per-project drill-down, differing only in the `where` clause used to select documents.
   */
  private async getDeletedDocumentSummaries(
    where: Prisma.DocumentWhereInput,
  ): Promise<DeletedDocumentSummary[]> {
    const documents = await this.prisma.document.findMany({
      where,
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
   *
   * If the document's project has itself been deleted, `targetProjectId` must be supplied
   * so the admin explicitly picks which active project the document is restored into,
   * rather than silently resurrecting it into a project that no longer exists.
   */
  async restoreDocument(
    documentId: string,
    userId: string,
    targetProjectId?: string,
  ): Promise<{ id: string }> {
    await this.assertAdmin(userId);

    const document = await this.prisma.document.findFirst({
      where: { id: documentId, deletedAt: { not: null } },
      select: {
        id: true,
        storageKey: true,
        projectId: true,
        project: { select: { deletedAt: true } },
      },
    });

    if (!document) {
      throw new NotFoundException('Deleted document not found');
    }

    const destinationProjectId = await this.resolveRestoreDestinationProject(
      document.projectId,
      document.project.deletedAt,
      targetProjectId,
    );

    await this.restoreDocumentRow(
      document.id,
      document.storageKey,
      destinationProjectId,
    );

    return { id: documentId };
  }

  /**
   * Restore a soft-deleted project: clear its `deletedAt` and restore every document that
   * was swept up by that same project deletion (matched by the shared `deletedAt` timestamp
   * `ProjectsService.deleteProject` gives both the project and its documents). Documents
   * trashed individually before the project was deleted keep a different `deletedAt` and are
   * left deleted, restorable on their own — admin only.
   */
  async restoreProject(
    projectId: string,
    userId: string,
  ): Promise<{ id: string; restoredDocuments: number }> {
    await this.assertAdmin(userId);

    const project = await this.prisma.project.findFirst({
      where: { id: projectId, deletedAt: { not: null } },
      select: { id: true, deletedAt: true },
    });

    if (!project) {
      throw new NotFoundException('Deleted project not found');
    }

    const cascadeDeletedAt = project.deletedAt as Date;

    // Claim the project row first so a concurrent purge cannot remove it (and its files)
    // out from under the restore.
    const claimed = await this.prisma.project.updateMany({
      where: { id: projectId, deletedAt: cascadeDeletedAt },
      data: { deletedAt: null, deletedById: null, deletedByEmail: null },
    });

    if (claimed.count === 0) {
      throw new NotFoundException('Deleted project not found');
    }

    const sweptDocuments = await this.prisma.document.findMany({
      where: { projectId, deletedAt: cascadeDeletedAt },
      select: { id: true, storageKey: true },
    });

    let restoredDocuments = 0;
    for (const document of sweptDocuments) {
      try {
        await this.restoreDocumentRow(
          document.id,
          document.storageKey,
          projectId,
        );
        restoredDocuments += 1;
      } catch (error) {
        this.logger.warn(
          `Could not restore document ${document.id} while restoring project ${projectId}: ${String(error)}`,
        );
      }
    }

    return { id: projectId, restoredDocuments };
  }

  /**
   * Figure out which active project a restored document should land in: the caller's
   * explicit choice if given (validated as an active project), otherwise the document's
   * original project — unless that project is itself deleted, in which case the admin must
   * choose one.
   */
  private async resolveRestoreDestinationProject(
    originalProjectId: string,
    originalProjectDeletedAt: Date | null,
    targetProjectId?: string,
  ): Promise<string> {
    if (targetProjectId) {
      const targetProject = await this.prisma.project.findFirst({
        where: { id: targetProjectId, deletedAt: null },
        select: { id: true },
      });

      if (!targetProject) {
        throw new BadRequestException(
          'Selected project was not found or is no longer available',
        );
      }

      return targetProjectId;
    }

    if (originalProjectDeletedAt) {
      throw new BadRequestException(
        'The original project has been deleted. Choose a project to restore this document into.',
      );
    }

    return originalProjectId;
  }

  /**
   * Shared restore mechanics for a single document row: claim it, move its file back out of
   * the deleted holding area, and close its open `DeletionLog` row. Used both for restoring a
   * single document and for restoring every document swept up by a project restore.
   */
  private async restoreDocumentRow(
    documentId: string,
    currentStorageKey: string,
    destinationProjectId: string,
  ): Promise<void> {
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
      log?.storageKey || currentStorageKey,
    );
    const restoredAt = new Date();

    // Claim the row first so a concurrent purge cannot delete the document (and its file)
    // out from under the restore. Nothing is moved unless this update wins.
    const claimed = await this.prisma.document.updateMany({
      where: { id: documentId, deletedAt: { not: null } },
      data: {
        deletedAt: null,
        storageKey: restoredStorageKey,
        projectId: destinationProjectId,
      },
    });

    if (claimed.count === 0) {
      throw new NotFoundException('Deleted document not found');
    }

    if (currentStorageKey && restoredStorageKey !== currentStorageKey) {
      try {
        await this.blobStore.moveFile(currentStorageKey, restoredStorageKey);
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
   * Permanently delete a soft-deleted project ahead of the retention window — admin only.
   */
  async permanentlyDeleteProject(
    projectId: string,
    userId: string,
  ): Promise<{ id: string }> {
    await this.assertAdmin(userId);

    const project = await this.prisma.project.findFirst({
      where: { id: projectId, deletedAt: { not: null } },
      select: { id: true },
    });

    if (!project) {
      throw new NotFoundException('Deleted project not found');
    }

    await this.purgeProject(projectId);

    return { id: projectId };
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
   * Permanently delete every project whose retention window has expired, along with
   * whatever documents remain in it. Safe to run repeatedly and concurrently: each project
   * is claimed with a conditional delete, and a missing file is never fatal.
   */
  async purgeExpiredProjects(
    now: Date = new Date(),
  ): Promise<{ purged: number }> {
    const cutoff = getPurgeCutoff(now);

    const expired = await this.prisma.project.findMany({
      where: { deletedAt: { not: null, lt: cutoff } },
      select: { id: true },
    });

    let purged = 0;

    for (const project of expired) {
      try {
        const removed = await this.purgeProject(project.id, cutoff);
        if (removed) {
          purged += 1;
        }
      } catch (error) {
        // One bad project must not stop the rest of the sweep.
        this.logger.error(
          `Failed to permanently delete project ${project.id}: ${String(error)}`,
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

  /**
   * Delete a project row (claimed with a conditional delete, same as `purgeDocument`) and
   * clean up whatever it leaves behind. Every remaining document in the project is, by
   * construction, already soft-deleted (`ProjectsService.deleteProject` sweeps all active
   * documents before a project can be recycled), so its file lives in the `deleted/` holding
   * area. Documents and memberships are removed from the database automatically by the
   * cascading foreign keys on `Document.project` and `ProjectMembership.project`; this only
   * has to clean up the files on disk and close the affected `DeletionLog` rows. Returns
   * false if another run got there first.
   */
  private async purgeProject(
    projectId: string,
    cutoff?: Date,
  ): Promise<boolean> {
    // Snapshot the documents before the cascade delete removes their rows.
    const documents = await this.prisma.document.findMany({
      where: { projectId, deletedAt: { not: null } },
      select: { id: true, storageKey: true },
    });

    const claimed = await this.prisma.project.deleteMany({
      where: {
        id: projectId,
        deletedAt: cutoff ? { not: null, lt: cutoff } : { not: null },
      },
    });

    if (claimed.count === 0) {
      return false;
    }

    for (const document of documents) {
      const deletedStorageKey = document.storageKey
        ? toDeletedStorageKey(document.storageKey)
        : '';

      if (!deletedStorageKey) {
        continue;
      }

      try {
        await this.blobStore.deleteFile(deletedStorageKey);
      } catch (error) {
        this.logger.warn(
          `Could not delete file for document ${document.id}: ${String(error)}`,
        );
      }
    }

    if (documents.length > 0) {
      await this.prisma.deletionLog.updateMany({
        where: {
          documentId: { in: documents.map((document) => document.id) },
          restoredAt: null,
          permanentlyDeletedAt: null,
        },
        data: { permanentlyDeletedAt: new Date() },
      });
    }

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
