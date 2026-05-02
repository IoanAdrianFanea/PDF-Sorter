// API base URL - backend runs on port 3000
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Auth API response types
export interface LoginResponse {
  accessToken: string;
}

export interface RegisterResponse {
  accessToken: string;
}

export interface User {
  id: string;
  email: string;
  role: 'USER' | 'ADMIN';
  fullName: string | null;
  language: string | null;
  timezone: string | null;
  createdAt: string;
}

export interface UpdateMePayload {
  fullName?: string;
  language?: string;
  timezone?: string;
}

// Auth service
export const authService = {
  /**
   * Register a new user
   * @throws Error with message if registration fails
   */
  async register(email: string, password: string): Promise<RegisterResponse> {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Important: allows HttpOnly cookies
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      if (response.status === 409) {
        throw new Error('Email already exists');
      }
      const error = await response.json().catch(() => ({ message: 'Registration failed' }));
      throw new Error(error.message || 'Registration failed');
    }

    return response.json();
  },

  /**
   * Login with email and password
   * @throws Error with message if login fails
   */
  async login(email: string, password: string): Promise<LoginResponse> {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Important: allows HttpOnly cookies
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Invalid email or password');
      }
      const error = await response.json().catch(() => ({ message: 'Login failed' }));
      throw new Error(error.message || 'Login failed');
    }

    return response.json();
  },

  /**
   * Get current user information
   * Requires valid accessToken
   */
  async getMe(accessToken: string): Promise<User> {
    const response = await fetch(`${API_URL}/auth/me`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Failed to get user information');
    }

    return response.json();
  },

  /**
   * Logout user
   * Revokes refresh tokens on the backend
   */
  async logout(accessToken: string): Promise<void> {
    const response = await fetch(`${API_URL}/auth/logout`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Logout failed');
    }
  },

  /**  
   * PATCH /auth/me - Update user profile information
   * @throws Error with message if update fails
   */
  async updateMe(accessToken: string, profileData: UpdateMePayload): Promise<User> {
    const response = await fetch(`${API_URL}/auth/me`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      credentials: 'include',
      body: JSON.stringify(profileData),
    });

    if (!response.ok) {
      const error = await response
        .json()
        .catch(() => ({ message: 'Failed to update user information' }));
      throw new Error(error.message || 'Failed to update user information');
    }

    return response.json();
  },
};
