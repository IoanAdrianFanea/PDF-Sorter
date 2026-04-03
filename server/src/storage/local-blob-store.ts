import { Injectable } from '@nestjs/common';
import { promises as fs } from 'fs';
import * as path from 'path';
import type { BlobStore } from './blob-store.interface';

// Local file storage implementation
@Injectable()
export class LocalBlobStore implements BlobStore {
  private readonly rootDir = './data';

  /**
   * Save a PDF file to disk at ./data/{userId}/{documentId}.pdf
   */
  async savePdf(
    userId: string,
    documentId: string,
    buffer: Buffer,
  ): Promise<{ storageKey: string }> {
    const storageKey = `${userId}/${documentId}.pdf`;
    const userDir = path.join(this.rootDir, userId);
    const filePath = path.join(this.rootDir, storageKey);

    // Create directory if it doesn't exist
    await fs.mkdir(userDir, { recursive: true });

    // Write file to disk
    await fs.writeFile(filePath, buffer);

    return { storageKey };
  }

  /**
   * Get a PDF file as a Buffer
   */
  async getPdf(userId: string, documentId: string): Promise<Buffer> {
    const storageKey = `${userId}/${documentId}.pdf`;
    const filePath = path.join(this.rootDir, storageKey);
    return await fs.readFile(filePath);
  }

  /**
   * Get full file system path from storage key
   */
  getPath(storageKey: string): string {
    return path.join(this.rootDir, storageKey);
  }

  /**
   * Delete a PDF file from disk
   */
  async deletePdf(storageKey: string): Promise<void> {
    const filePath = path.join(this.rootDir, storageKey);
    try {
      await fs.unlink(filePath);
    } catch (error) {
      // Ignore error if file doesn't exist
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
        throw error;
      }
    }
  }
}
