// Storage abstraction interface
// Allows swapping between local storage and S3/cloud storage
export interface BlobStore {
  /**
   * Save a file
   */
  saveFile(
    userId: string,
    documentId: string,
    buffer: Buffer,
    mimeType: string,
  ): Promise<{ storageKey: string }>;

  /**
   * Get a file as a Buffer
   */
  getFile(userId: string, documentId: string): Promise<Buffer>;

  /**
   * Get the full path to a stored file
   */
  getPath(storageKey: string): string;

  /**
   * Move a stored file to a new key (used by soft delete, restore and archiving)
   */
  moveFile(fromKey: string, toKey: string): Promise<void>;

  /**
   * Delete a file
   */
  deleteFile(storageKey: string): Promise<void>;
}

// Injection token for BlobStore
export const BLOB_STORE = Symbol('BLOB_STORE');
