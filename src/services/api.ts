export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

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

// API Xác thực
export const authApi = {
    login: (username: string, password: string) =>
        apiRequest<{ access_token: string; user: { id: string; username: string; display_name: string; avatar_url?: string } }>(
            '/api/auth/login',
            { method: 'POST', body: { username, password } }
        ),

    register: (username: string, password: string, displayName: string) =>
        apiRequest<{ access_token: string; user: { id: string; username: string; display_name: string; avatar_url?: string } }>(
            '/api/auth/register',
            { method: 'POST', body: { username, password, display_name: displayName } }
        ),

    me: (token: string) =>
        apiRequest<{ id: string; username: string; display_name: string; avatar_url?: string }>(
            '/api/auth/me',
            { token }
        ),
};

// API Cuộc hội thoại
export const conversationsApi = {
    getAll: (token: string) =>
        apiRequest<{ conversations: ConversationResponse[] }>('/api/conversations', { token }),

    create: (token: string, data: { type: string; name?: string; member_ids?: string[] }) =>
        apiRequest<ConversationResponse>('/api/conversations', { method: 'POST', token, body: data }),

    getMessages: (token: string, conversationId: string) =>
        apiRequest<{ messages: MessageResponse[] }>(`/api/conversations/${conversationId}/messages`, { token }),

    togglePin: (token: string, conversationId: string) =>
        apiRequest<{ is_pinned: boolean; message: string }>(`/api/conversations/${conversationId}/pin`, { method: 'PUT', token }),

    clearMessages: (token: string, conversationId: string) =>
        apiRequest<{ deleted_count: number; message: string }>(`/api/conversations/${conversationId}/messages`, { method: 'DELETE', token }),

    delete: (token: string, conversationId: string) =>
        apiRequest<{ message: string }>(`/api/conversations/${conversationId}`, { method: 'DELETE', token }),
};

// API Người dùng
export const usersApi = {
    search: (token: string, query: string) =>
        apiRequest<{ users: UserResponse[] }>(`/api/users/search?q=${encodeURIComponent(query)}`, { token }),

    getById: (token: string, userId: string) =>
        apiRequest<UserResponse>(`/api/users/${userId}`, { token }),
};

// API Bạn bè
export const friendsApi = {
    getAll: (token: string) =>
        apiRequest<{ friends: FriendResponse[] }>('/api/friends', { token }),

    getRequests: (token: string) =>
        apiRequest<{ requests: FriendRequestResponse[] }>('/api/friends/requests', { token }),

    getSentRequests: (token: string) =>
        apiRequest<{ sent_requests: SentRequestResponse[] }>('/api/friends/sent', { token }),

    sendRequest: (token: string, toUserId: string) =>
        apiRequest<{ message: string; request_id: string }>('/api/friends/request', {
            method: 'POST',
            token,
            body: { to_user_id: toUserId }
        }),

    acceptRequest: (token: string, requestId: string) =>
        apiRequest<{ message: string }>(`/api/friends/accept/${requestId}`, { method: 'POST', token }),

    rejectRequest: (token: string, requestId: string) =>
        apiRequest<{ message: string }>(`/api/friends/reject/${requestId}`, { method: 'POST', token }),

    unfriend: (token: string, friendId: string) =>
        apiRequest<{ message: string }>(`/api/friends/${friendId}`, { method: 'DELETE', token }),

    cancelRequest: (token: string, requestId: string) =>
        apiRequest<{ message: string }>(`/api/friends/request/${requestId}`, { method: 'DELETE', token }),
};

// API Files
export interface FileUploadResponse {
    file_url: string;
    file_name: string;
    file_size: number;
    file_type: 'image' | 'file';
}

export const filesApi = {
    upload: async (token: string, file: File): Promise<FileUploadResponse> => {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch(`${API_BASE_URL}/api/files/upload`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
            body: formData,
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ detail: 'Upload failed' }));
            throw new Error(error.detail || 'Upload failed');
        }

        return response.json();
    },
};
export interface UserResponse {
    id: string;
    username: string;
    display_name: string;
    avatar_url?: string;
    status: 'online' | 'offline';
}

export interface FriendResponse {
    id: string;
    username: string;
    display_name: string;
    avatar_url?: string;
    status: 'online' | 'offline';
}

export interface FriendRequestResponse {
    id: string;
    from_user_id: string;
    from_user_name: string;
    from_user_avatar?: string;
    to_user_id: string;
    to_user_name: string;
    to_user_avatar?: string;
    status: 'pending' | 'accepted' | 'rejected';
    created_at: string;
}

export interface SentRequestResponse {
    id: string;
    to_user_id: string;
    to_user_name: string;
    to_user_avatar?: string;
    status: 'pending';
    created_at: string;
}

export interface ConversationResponse {
    _id: string;
    type: 'private' | 'group' | 'self';
    name?: string;
    members: Array<{
        user_id: string;
        role: 'admin' | 'member';
        joined_at: string;
    }>;
    created_by: string;
    created_at: string;
    last_message_at?: string;
    unread_count: number;
}

export interface MessageResponse {
    _id: string;
    conversation_id: string;
    sender_id: string;
    content: string;
    type: 'text' | 'file' | 'image' | 'system';
    file_url?: string;
    file_name?: string;
    status: Array<{
        user_id: string;
        status: 'sent' | 'delivered' | 'read';
        at: string;
    }>;
    created_at: string;
}