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

export async function findAllUsers(): Promise<UserSummary[]> {
  const accessToken = sessionStorage.getItem('accessToken');
  if (!accessToken) {
    throw new Error('Not authenticated');
  }
  
  const response = await fetch(`${API_URL}/users`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Failed to fetch users');
  }

  return response.json();
}

export async function setUserRole(userId: string, role: 'USER' | 'ADMIN'): Promise<UserSummary> {
  const accessToken = sessionStorage.getItem('accessToken');
  if (!accessToken) {
    throw new Error('Not authenticated');
  }

  const response = await fetch(`${API_URL}/users/${encodeURIComponent(userId)}/role`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ role }),
  });

  if (!response.ok) {
    throw new Error('Failed to update user role');
  }

  return response.json();
}

export async function deleteUser(userId: string): Promise<void> {
  const accessToken = sessionStorage.getItem('accessToken');
  if (!accessToken) {
    throw new Error('Not authenticated');
  }

  const response = await fetch(`${API_URL}/users/${encodeURIComponent(userId)}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Failed to delete user');
  }
}

