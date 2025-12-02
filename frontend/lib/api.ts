import { Session, SessionListResponse } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

async function fetchApi<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const url = `${API_URL}${endpoint}`;
  
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
    throw new ApiError(response.status, error.detail || 'Request failed');
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return null as T;
  }

  return response.json();
}

export const api = {
  // Get all sessions
  async getSessions(skip = 0, limit = 100): Promise<SessionListResponse> {
    return fetchApi<SessionListResponse>(
      `/api/v1/sessions?skip=${skip}&limit=${limit}`
    );
  },

  // Get session by ID
  async getSession(id: string): Promise<Session> {
    return fetchApi<Session>(`/api/v1/sessions/${id}`);
  },

  // Delete session
  async deleteSession(id: string): Promise<void> {
    return fetchApi<void>(`/api/v1/sessions/${id}`, {
      method: 'DELETE',
    });
  },

  // Health check
  async healthCheck(): Promise<{ status: string; app: string; version: string }> {
    return fetchApi('/health');
  },
};