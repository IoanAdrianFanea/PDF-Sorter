import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { BlobStore } from '../storage/blob-store.interface';
import { BLOB_STORE } from '../storage/blob-store.interface';
import archiver from 'archiver';
import { Readable } from 'stream';
import { promises as fs } from 'fs';

@Injectable()
export class ExportsService {
  constructor(
    private prisma: PrismaService,
    @Inject(BLOB_STORE) private blobStore: BlobStore,
  ) {}

  /**
   * Get a single document's PDF for download
   */
  async downloadDocument(documentId: string, _userId: string): Promise<{ buffer: Buffer; filename: string }> {
    // Company-wide visibility: any authenticated user can download existing docs.
    const document = await this.prisma.document.findUnique({
      where: { id: documentId },
    });

    if (!document) {
      throw new NotFoundException('Document not found');
    }

    // Read PDF via persisted storage key to avoid user-scope path coupling.
    const filePath = this.blobStore.getPath(document.storageKey);
    const pdfBuffer = await fs.readFile(filePath);

    return {
      buffer: pdfBuffer,
      filename: document.originalFilename,
    };
  }

  /**
   * Create a ZIP file containing multiple documents
   */
  async exportDocuments(documentIds: string[], _userId: string): Promise<{ stream: Readable; filename: string }> {
    // Company-wide visibility: fetch requested documents without owner filter.
    const documents = await this.prisma.document.findMany({
      where: {
        id: { in: documentIds },
      },
    });

    // Check if all requested documents were found
    if (documents.length !== documentIds.length) {
      throw new NotFoundException('One or more documents not found');
    }

    // Create ZIP archive
    const archive = archiver('zip', {
      zlib: { level: 9 }, // Maximum compression
    });

    // Add each document to the archive
    for (const document of documents) {
      try {
        const filePath = this.blobStore.getPath(document.storageKey);
        const pdfBuffer = await fs.readFile(filePath);
        archive.append(pdfBuffer, { name: document.originalFilename });
      } catch (error) {
        console.error(`Failed to add document ${document.id} to archive:`, error);
        // Continue with other documents
      }
    }

    // Finalize the archive (no more files will be added)
    archive.finalize();

    // Generate filename with timestamp
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `documents-export-${timestamp}.zip`;

    return {
      stream: archive,
      filename,
    };
  }
}
