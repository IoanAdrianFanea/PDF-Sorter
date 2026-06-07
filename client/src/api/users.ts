const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export interface UserSummary {
  id: string;
  email: string;
  fullName: string | null;
  role: 'USER' | 'ADMIN';
  createdAt: string;
}

export async function searchUsers(q: string): Promise<UserSummary[]> {
  const accessToken = sessionStorage.getItem('accessToken');
  if (!accessToken) {
    throw new Error('Not authenticated');
  }

  const params = new URLSearchParams({ q });
  const response = await fetch(`${API_URL}/users/search?${params}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Failed to search users');
  }

  return response.json();
}
