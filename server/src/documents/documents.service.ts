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
      const { text: extractedText, pageCount } =
        await this.extractionService.extractTextFromPdfPath(filePath);

      // Save extracted text
      await this.prisma.documentText.upsert({
        where: { documentId: document.id },
        create: {
          documentId: document.id,
          extractedText,
          pageCount,
        },
        update: {
          extractedText,
          pageCount,
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
            extractedText: true,
            pageCount: true,
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

    // Create a preview of the extracted text (first 150 characters)
    const textPreview = document.text?.extractedText
      ? document.text.extractedText.substring(0, 150) + 
        (document.text.extractedText.length > 150 ? '...' : '')
      : null;

    return {
      id: document.id,
      originalFilename: document.originalFilename,
      mimeType: document.mimeType,
      sizeBytes: document.sizeBytes,
      uploadedAt: document.uploadedAt,
      status: document.status,
      errorMessage: document.errorMessage,
      extractedAt: document.text?.extractedAt || null,
      pageCount: document.text?.pageCount || null,
      textPreview,
    };
  }

  /**
   * List all documents for current user
   */
  async listDocuments(userId: string) {
    const documents = await this.prisma.document.findMany({
      where: { ownerId: userId },
      orderBy: { uploadedAt: 'desc' },
      take: 50,
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

  /**
   * Get extracted text for a document
   */
  async getDocumentText(documentId: string, userId: string) {
    const document = await this.prisma.document.findUnique({
      where: { id: documentId },
      include: {
        text: true,
      },
    });

    if (!document) {
      throw new NotFoundException('Document not found');
    }

    // Check ownership
    if (document.ownerId !== userId) {
      throw new NotFoundException('Document not found');
    }

    if (!document.text) {
      throw new NotFoundException('No extracted text available');
    }

    return {
      documentId: document.id,
      extractedText: document.text.extractedText,
      extractedAt: document.text.extractedAt,
    };
  }

  /**
   * Search documents by text content
   */
  async searchDocuments(userId: string, query: string) {
    // Return empty results for invalid queries
    if (!query || query.trim().length < 2) {
      return { results: [] };
    }

    const lowerQuery = query.toLowerCase();

    // Get all user's documents with extracted text
    const allDocuments = await this.prisma.document.findMany({
      where: {
        ownerId: userId,
        text: {
          isNot: null,
        },
      },
      include: {
        text: {
          select: {
            extractedText: true,
          },
        },
      },
      orderBy: { uploadedAt: 'desc' },
    });

    // Filter documents that contain the query (case-insensitive)
    const matchingDocuments = allDocuments
      .filter((doc) => {
        const text = doc.text?.extractedText || '';
        return text.toLowerCase().includes(lowerQuery);
      })
      .slice(0, 20); // Limit to 20 results

    // Generate snippets for each result
    const results = matchingDocuments.map((doc) => ({
      documentId: doc.id,
      filename: doc.originalFilename,
      snippet: this.createSnippet(doc.text?.extractedText || '', query),
    }));

    return { results };
  }

  /**
   * Create a contextual snippet with highlighted match
   */
  private createSnippet(text: string, query: string): string {
    const CHARS_BEFORE = 80;
    const CHARS_AFTER = 80;

    // Normalize whitespace in text
    const normalizedText = text.replace(/\s+/g, ' ').trim();

    // Find first match (case-insensitive)
    const lowerText = normalizedText.toLowerCase();
    const lowerQuery = query.toLowerCase();
    const matchIndex = lowerText.indexOf(lowerQuery);

    // No match found (shouldn't happen due to query, but safety check)
    if (matchIndex === -1) {
      return '...';
    }

    // Calculate snippet boundaries
    const startIndex = Math.max(0, matchIndex - CHARS_BEFORE);
    const endIndex = Math.min(
      normalizedText.length,
      matchIndex + query.length + CHARS_AFTER,
    );

    // Extract snippet
    let snippet = normalizedText.substring(startIndex, endIndex);

    // Add ellipsis if clipped
    const prefixEllipsis = startIndex > 0 ? '... ' : '';
    const suffixEllipsis = endIndex < normalizedText.length ? ' ...' : '';

    // Highlight the match with <mark> tags
    const matchStart = matchIndex - startIndex;
    const matchEnd = matchStart + query.length;
    const beforeMatch = snippet.substring(0, matchStart);
    const match = snippet.substring(matchStart, matchEnd);
    const afterMatch = snippet.substring(matchEnd);

    return `${prefixEllipsis}${beforeMatch}<mark>${match}</mark>${afterMatch}${suffixEllipsis}`;
  }
}
