const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

interface ApiOptions {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
    body?: unknown;
    token?: string;
}

export async function apiRequest<T>(endpoint: string, options: ApiOptions = {}): Promise<T> {
    const { method = 'GET', body, token } = options;

    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: 'Network error' }));
        throw new Error(error.detail || 'Request failed');
    }

    return response.json();
}

// Auth API
export const authApi = {
    login: (username: string, password: string) =>
        apiRequest<{ access_token: string; user: { id: string; username: string; display_name: string } }>(
            '/api/auth/login',
            { method: 'POST', body: { username, password } }
        ),

    register: (username: string, password: string, displayName: string) =>
        apiRequest<{ access_token: string; user: { id: string; username: string; display_name: string } }>(
            '/api/auth/register',
            { method: 'POST', body: { username, password, display_name: displayName } }
        ),

    me: (token: string) =>
        apiRequest<{ id: string; username: string; display_name: string; avatar_url?: string }>(
            '/api/auth/me',
            { token }
        ),
};

// Conversations API
export const conversationsApi = {
    getAll: (token: string) =>
        apiRequest<{ conversations: unknown[] }>('/api/conversations', { token }),

    create: (token: string, data: { type: string; name?: string; memberIds?: string[] }) =>
        apiRequest<unknown>('/api/conversations', { method: 'POST', token, body: data }),

    getMessages: (token: string, conversationId: string) =>
        apiRequest<{ messages: unknown[] }>(`/api/conversations/${conversationId}/messages`, { token }),
};

// Users API
export const usersApi = {
    search: (token: string, query: string) =>
        apiRequest<{ users: unknown[] }>(`/api/users/search?q=${encodeURIComponent(query)}`, { token }),
};
