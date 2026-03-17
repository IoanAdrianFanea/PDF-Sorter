const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export interface Project {
  id: string;
  name: string;
}

export const projectsService = {
  async listProjects(): Promise<Project[]> {
    const accessToken = sessionStorage.getItem('accessToken');
    if (!accessToken) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(`${API_URL}/projects`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch projects');
    }

    return response.json();
  },
};
