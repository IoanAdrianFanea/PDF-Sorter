import { Injectable } from '@nestjs/common';
import { promises as fs } from 'fs';
import * as path from 'path';
import type { BlobStore } from './blob-store.interface';

// Local file storage implementation
@Injectable()
export class LocalBlobStore implements BlobStore {
  private readonly rootDir = './data';

  /**
   * Save a file to disk at ./data/{userId}/{documentId}.{ext}
   */
  async saveFile(
    userId: string,
    documentId: string,
    buffer: Buffer,
    mimeType: string,
  ): Promise<{ storageKey: string }> {
    const extension = this.getExtensionFromMimeType(mimeType);
    const storageKey = `${userId}/${documentId}${extension}`;
    const userDir = path.join(this.rootDir, userId);
    const filePath = path.join(this.rootDir, storageKey);

    // Create directory if it doesn't exist
    await fs.mkdir(userDir, { recursive: true });

    // Write file to disk
    await fs.writeFile(filePath, buffer);

    return { storageKey };
  }

  /**
   * Get a file as a Buffer
   */
  async getFile(userId: string, documentId: string): Promise<Buffer> {
    const extensions = ['.pdf', '.jpg', '.png'];

    for (const extension of extensions) {
      const storageKey = `${userId}/${documentId}${extension}`;
      const filePath = path.join(this.rootDir, storageKey);

      try {
        return await fs.readFile(filePath);
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
          throw error;
        }
      }
    }

    throw new Error('File not found');
  }

  /**
   * Get full file system path from storage key
   */
  getPath(storageKey: string): string {
    return path.join(this.rootDir, storageKey);
  }

  /**
   * Delete a file from disk
   */
  async deleteFile(storageKey: string): Promise<void> {
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

  private getExtensionFromMimeType(mimeType: string): string {
    switch (mimeType) {
      case 'application/pdf':
        return '.pdf';
      case 'image/jpeg':
        return '.jpg';
      case 'image/png':
        return '.png';
      default:
        throw new Error(`Unsupported mime type: ${mimeType}`);
    }
  }
}
