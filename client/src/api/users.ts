const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export type AccountStatus = 'PENDING' | 'ACTIVE' | 'REJECTED';

export interface UserSummary {
  id: string;
  email: string;
  fullName: string | null;
  role: 'USER' | 'ADMIN';
  createdAt: string;
}

export interface UserWithStatus extends UserSummary {
  accountStatus: AccountStatus;
}

export interface CreateUserPayload {
  fullName: string;
  email: string;
  password: string;
  role: 'USER' | 'ADMIN';
}

export async function createUser(payload: CreateUserPayload): Promise<UserSummary> {
  const accessToken = sessionStorage.getItem('accessToken');
  if (!accessToken) {
    throw new Error('Not authenticated');
  }

  const response = await fetch(`${API_URL}/users`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => null);
    throw new Error(data?.message ?? 'Failed to create user');
  }

  return response.json();
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

export async function getPendingUsers(): Promise<UserWithStatus[]> {
  const accessToken = sessionStorage.getItem('accessToken');
  if (!accessToken) throw new Error('Not authenticated');

  const response = await fetch(`${API_URL}/users/pending`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    credentials: 'include',
  });

  if (!response.ok) throw new Error('Failed to fetch pending users');
  return response.json();
}

export async function getRejectedUsers(): Promise<UserWithStatus[]> {
  const accessToken = sessionStorage.getItem('accessToken');
  if (!accessToken) throw new Error('Not authenticated');

  const response = await fetch(`${API_URL}/users/rejected`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    credentials: 'include',
  });

  if (!response.ok) throw new Error('Failed to fetch rejected users');
  return response.json();
}

export async function updateUserAccountStatus(
  userId: string,
  status: AccountStatus,
): Promise<UserWithStatus> {
  const accessToken = sessionStorage.getItem('accessToken');
  if (!accessToken) throw new Error('Not authenticated');

  const response = await fetch(`${API_URL}/users/${encodeURIComponent(userId)}/status`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ status }),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => null);
    throw new Error(data?.message ?? 'Failed to update account status');
  }

  return response.json();
}

