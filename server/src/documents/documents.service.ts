import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ExtractionService } from './extraction.service';
import { BLOB_STORE, type BlobStore } from '../storage/blob-store.interface';
import { DocumentStatus } from '@prisma/client';

// Documents business logic
@Injectable()
export class DocumentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly extractionService: ExtractionService,
    @Inject(BLOB_STORE) private readonly blobStore: BlobStore,
  ) {}

  /**
   * Upload and process a PDF document
   */
  async uploadDocument(
    userId: string,
    file: Express.Multer.File,
  ): Promise<{ id: string; status: DocumentStatus }> {
    let documentId: string | undefined;

    try {
      // Create document record
      const document = await this.prisma.document.create({
        data: {
          ownerId: userId,
          originalFilename: file.originalname,
          mimeType: file.mimetype,
          sizeBytes: file.size,
          storageKey: '',
          status: DocumentStatus.UPLOADED,
        },
      });

      documentId = document.id;

      // Save file to storage
      const { storageKey } = await this.blobStore.savePdf(
        userId,
        document.id,
        file.buffer,
      );

      // Update document with storage key
      await this.prisma.document.update({
        where: { id: document.id },
        data: { storageKey },
      });

      // Set status to processing
      await this.prisma.document.update({
        where: { id: document.id },
        data: { status: DocumentStatus.PROCESSING },
      });

      // Extract text from PDF
      const filePath = this.blobStore.getPath(storageKey);
      const extractedText =
        await this.extractionService.extractTextFromPdfPath(filePath);

      // Save extracted text
      await this.prisma.documentText.upsert({
        where: { documentId: document.id },
        create: {
          documentId: document.id,
          extractedText,
        },
        update: {
          extractedText,
        },
      });

      // Mark as processed
      await this.prisma.document.update({
        where: { id: document.id },
        data: { status: DocumentStatus.PROCESSED },
      });

      return {
        id: document.id,
        status: DocumentStatus.PROCESSED,
      };
    } catch (error) {
      // Mark document as failed if any step fails
      if (documentId) {
        await this.prisma.document.update({
          where: { id: documentId },
          data: {
            status: DocumentStatus.FAILED,
            errorMessage:
              error instanceof Error ? error.message : 'Unknown error',
          },
        });
      }

      throw error;
    }
  }

  /**
   * Get a single document by ID
   */
  async getDocument(documentId: string, userId: string) {
    const document = await this.prisma.document.findUnique({
      where: { id: documentId },
      include: {
        text: {
          select: {
            extractedAt: true,
          },
        },
      },
    });

    if (!document) {
      throw new NotFoundException('Document not found');
    }

    // Check ownership
    if (document.ownerId !== userId) {
      throw new NotFoundException('Document not found');
    }

    return {
      id: document.id,
      originalFilename: document.originalFilename,
      mimeType: document.mimeType,
      sizeBytes: document.sizeBytes,
      uploadedAt: document.uploadedAt,
      status: document.status,
      errorMessage: document.errorMessage,
      extractedAt: document.text?.extractedAt || null,
    };
  }

  /**
   * List all documents for current user
   */
  async listDocuments(userId: string) {
    const documents = await this.prisma.document.findMany({
      where: { ownerId: userId },
      orderBy: { uploadedAt: 'desc' },
      select: {
        id: true,
        originalFilename: true,
        mimeType: true,
        sizeBytes: true,
        uploadedAt: true,
        status: true,
        errorMessage: true,
      },
    });

    return documents;
  }
}
