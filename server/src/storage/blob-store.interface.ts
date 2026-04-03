// Storage abstraction interface
// Allows swapping between local storage and S3/cloud storage
export interface BlobStore {
  /**
   * Save a PDF file
   */
  savePdf(
    userId: string,
    documentId: string,
    buffer: Buffer,
  ): Promise<{ storageKey: string }>;

  /**
   * Get a PDF file as a Buffer
   */
  getPdf(userId: string, documentId: string): Promise<Buffer>;

  /**
   * Get the full path to a stored file
   */
  getPath(storageKey: string): string;

  /**
   * Delete a PDF file
   */
  deletePdf(storageKey: string): Promise<void>;
}

// Injection token for BlobStore
export const BLOB_STORE = Symbol('BLOB_STORE');
