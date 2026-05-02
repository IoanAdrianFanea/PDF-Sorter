// API base URL from environment variable
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export type DocumentStatus = 'UPLOADED' | 'QUEUED' | 'PROCESSING' | 'PROCESSED' | 'FAILED';

export interface Document {
  id: string;
  projectId?: string;
  projectName?: string;
  originalFilename: string;
  mimeType: string;
  sizeBytes: number;
  uploadedAt: string;
  status: DocumentStatus;
  errorMessage?: string | null;
  uploadedByEmail?: string;
  extractedAt?: string | null;
  pageCount?: number | null;
  textPreview?: string | null;
}

export interface ListDocumentsFilters {
  projectId?: string;
  mainFilter?: string;
  supplier?: string;
  materialType?: string;
  quantity?: string;
  orderNumber?: string;
  deliveryDateFrom?: string;
  deliveryDateTo?: string;
  sortBy?: 'upload-newest' | 'upload-oldest' | 'name-asc' | 'name-desc' | 'status';
}

export interface UploadResponse {
  id: string;
  status: DocumentStatus;
}

// Documents API service
export const documentsService = {
  /**
   * Upload a PDF file
   */
  async uploadDocument(file: File, projectId: string): Promise<UploadResponse> {
    const accessToken = sessionStorage.getItem('accessToken');
    if (!accessToken) {
      throw new Error('Not authenticated');
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('projectId', projectId);

    const response = await fetch(`${API_URL}/documents/upload`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      credentials: 'include',
      body: formData,
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Authentication required');
      }
      if (response.status === 400) {
        const error = await response.json().catch(() => ({ message: 'Invalid file' }));
        throw new Error(error.message || 'Invalid file');
      }
      if (response.status === 413) {
        throw new Error('File too large. Maximum size is 25MB');
      }
      const error = await response.json().catch(() => ({ message: 'Upload failed' }));
      throw new Error(error.message || 'Upload failed');
    }

    return response.json();
  },

  /**
   * Get all documents for current user
   */
  async listDocuments(filters?: ListDocumentsFilters): Promise<Document[]> {
    const accessToken = sessionStorage.getItem('accessToken');
    if (!accessToken) {
      throw new Error('Not authenticated');
    }

    const params = new URLSearchParams();
    if (filters) {
      const entries = Object.entries(filters) as Array<[keyof ListDocumentsFilters, string | undefined]>;
      for (const [key, value] of entries) {
        if (value && value.trim() !== '') {
          params.set(key, value);
        }
      }
    }

    const queryString = params.toString();
    const url = queryString ? `${API_URL}/documents?${queryString}` : `${API_URL}/documents`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch documents');
    }

    return response.json();
  },

  /**
   * Get a single document by ID
   */
  async getDocument(id: string): Promise<Document> {
    const accessToken = sessionStorage.getItem('accessToken');
    if (!accessToken) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(`${API_URL}/documents/${id}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      credentials: 'include',
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Document not found');
      }
      throw new Error('Failed to fetch document');
    }

    return response.json();
  },

  /**
   * Get extracted text for a document
   */
  async getDocumentText(id: string): Promise<DocumentText> {
    const accessToken = sessionStorage.getItem('accessToken');
    if (!accessToken) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(`${API_URL}/documents/${id}/text`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      credentials: 'include',
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Extracted text not found');
      }
      throw new Error('Failed to fetch document text');
    }

    return response.json();
  },

  /**
   * Search documents by filename and text content
   */
  async searchDocuments(query: string): Promise<{ results: SearchResult[] }> {
    const accessToken = sessionStorage.getItem('accessToken');
    if (!accessToken) {
      throw new Error('Not authenticated');
    }

    const params = new URLSearchParams({ q: query });
    const response = await fetch(`${API_URL}/documents/search?${params}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      credentials: 'include',
    });

    if (!response.ok) {
      if (response.status === 400) {
        const error = await response.json().catch(() => ({ message: 'Invalid search query' }));
        throw new Error(error.message || 'Invalid search query');
      }
      throw new Error('Search failed');
    }

    return response.json();
  },

  /**
   * Delete a single document
   */
  async deleteDocument(id: string): Promise<{ success: boolean }> {
    const accessToken = sessionStorage.getItem('accessToken');
    if (!accessToken) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(`${API_URL}/documents/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      credentials: 'include',
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Document not found');
      }
      throw new Error('Failed to delete document');
    }

    return response.json();
  },

  /**
   * Bulk delete multiple documents
   */
  async bulkDeleteDocuments(documentIds: string[]): Promise<{ deleted: number; failed: string[] }> {
    const accessToken = sessionStorage.getItem('accessToken');
    if (!accessToken) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(`${API_URL}/documents/bulk-delete`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ documentIds }),
    });

    if (!response.ok) {
      throw new Error('Failed to delete documents');
    }

    return response.json();
  },
};

export interface SearchResult {
  documentId: string;
  filename: string;
  snippet: string;
}

export interface DocumentText {
  documentId: string;
  extractedText: string;
  extractedAt: string;
}
