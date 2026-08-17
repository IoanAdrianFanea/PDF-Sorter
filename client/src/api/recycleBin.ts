const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export interface DeletedDocument {
  id: string;
  originalFilename: string;
  mimeType: string;
  sizeBytes: number;
  projectId: string;
  projectName: string;
  deletedAt: string;
  deletedByEmail: string | null;
  deletedByName: string | null;
  daysRemaining: number;
  retentionDays: number;
}

function authHeaders(): Record<string, string> {
  const accessToken = sessionStorage.getItem('accessToken');
  if (!accessToken) {
    throw new Error('Not authenticated');
  }
  return { Authorization: `Bearer ${accessToken}` };
}

async function readError(response: Response, fallback: string): Promise<string> {
  const data = await response.json().catch(() => null);
  return data?.message ?? fallback;
}

export async function getDeletedDocuments(): Promise<DeletedDocument[]> {
  const response = await fetch(`${API_URL}/recycle-bin`, {
    headers: authHeaders(),
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error(await readError(response, 'Failed to load the recycle bin'));
  }

  return response.json();
}

export async function restoreDocument(id: string): Promise<void> {
  const response = await fetch(`${API_URL}/recycle-bin/${encodeURIComponent(id)}/restore`, {
    method: 'POST',
    headers: authHeaders(),
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error(await readError(response, 'Failed to restore document'));
  }
}

export async function permanentlyDeleteDocument(id: string): Promise<void> {
  const response = await fetch(`${API_URL}/recycle-bin/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    headers: authHeaders(),
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error(await readError(response, 'Failed to permanently delete document'));
  }
}
