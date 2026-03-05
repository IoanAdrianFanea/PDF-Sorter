import { Injectable } from '@nestjs/common';
import { promises as fs } from 'fs';
import * as path from 'path';
import type { BlobStore } from './blob-store.interface';

// Local file storage implementation
@Injectable()
export class LocalBlobStore implements BlobStore {
  private readonly rootDir = './data';

  /**
   * Save a PDF file to disk at ./data/{ownerId}/{documentId}.pdf
   */
  async savePdf(
    ownerId: string,
    documentId: string,
    buffer: Buffer,
  ): Promise<{ storageKey: string }> {
    const storageKey = `${ownerId}/${documentId}.pdf`;
    const ownerDir = path.join(this.rootDir, ownerId);
    const filePath = path.join(this.rootDir, storageKey);

    // Create directory if it doesn't exist
    await fs.mkdir(ownerDir, { recursive: true });

    // Write file to disk
    await fs.writeFile(filePath, buffer);

    return { storageKey };
  }

  /**
   * Get full file system path from storage key
   */
  getPath(storageKey: string): string {
    return path.join(this.rootDir, storageKey);
  }
}
