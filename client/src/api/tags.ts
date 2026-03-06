// API base URL from environment variable
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export interface Tag {
  id: string;
  name: string;
  createdAt?: string;
}

export interface CreateTagRequest {
  name: string;
}

// Tags API service
export const tagsService = {
  /**
   * Create a new tag
   */
  async createTag(name: string): Promise<Tag> {
    const accessToken = sessionStorage.getItem('accessToken');
    if (!accessToken) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(`${API_URL}/tags`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      credentials: 'include',
      body: JSON.stringify({ name }),
    });

    if (!response.ok) {
      if (response.status === 409) {
        throw new Error('Tag already exists');
      }
      const error = await response.json().catch(() => ({ message: 'Failed to create tag' }));
      throw new Error(error.message || 'Failed to create tag');
    }

    return response.json();
  },

  /**
   * Get all tags for current user
   */
  async listTags(): Promise<Tag[]> {
    const accessToken = sessionStorage.getItem('accessToken');
    if (!accessToken) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(`${API_URL}/tags`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch tags');
    }

    return response.json();
  },

  /**
   * Attach a tag to a document
   */
  async attachTag(documentId: string, tagId: string): Promise<{ success: boolean }> {
    const accessToken = sessionStorage.getItem('accessToken');
    if (!accessToken) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(`${API_URL}/documents/${documentId}/tags`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      credentials: 'include',
      body: JSON.stringify({ tagId }),
    });

    if (!response.ok) {
      if (response.status === 400) {
        const error = await response.json().catch(() => ({ message: 'Tag already attached' }));
        throw new Error(error.message || 'Tag already attached');
      }
      throw new Error('Failed to attach tag');
    }

    return response.json();
  },

  /**
   * Remove a tag from a document
   */
  async removeTag(documentId: string, tagId: string): Promise<{ success: boolean }> {
    const accessToken = sessionStorage.getItem('accessToken');
    if (!accessToken) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(`${API_URL}/documents/${documentId}/tags/${tagId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Failed to remove tag');
    }

    return response.json();
  },

  /**
   * Delete a tag (removes from all documents)
   */
  async deleteTag(tagId: string): Promise<{ success: boolean }> {
    const accessToken = sessionStorage.getItem('accessToken');
    if (!accessToken) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(`${API_URL}/tags/${tagId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      credentials: 'include',
    });

    if (!response.ok) {
      const errorText = await response.text();
      let error;
      try {
        error = JSON.parse(errorText);
      } catch {
        error = { message: errorText || 'Failed to delete tag' };
      }
      throw new Error(error.message || 'Failed to delete tag');
    }

    return response.json();
  },
};
