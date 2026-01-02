export interface User {
    id: string;
    username: string;
    displayName: string;
    avatarUrl?: string;
    status?: 'online' | 'offline';
    lastOnline?: Date;
}

export interface Conversation {
    id: string;
    type: 'private' | 'group' | 'self';
    name?: string;
    avatarUrl?: string;
    members: ConversationMember[];
    lastMessage?: Message;
    unreadCount: number;
    createdAt: Date;
    updatedAt: Date;
}

export interface ConversationMember {
    userId: string;
    role: 'admin' | 'member';
    joinedAt: Date;
}

export interface Message {
    id: string;
    conversationId: string;
    senderId: string;
    content: string;
    type: 'text' | 'file' | 'image' | 'system';
    file?: FileAttachment;
    status: MessageStatus[];
    createdAt: Date;
}

export interface FileAttachment {
    url: string;
    name: string;
    size: number;
    mimeType: string;
}

export interface MessageStatus {
    userId: string;
    status: 'sent' | 'delivered' | 'read';
    at: Date;
}

// API Response types
export interface ApiResponse<T> {
    data: T;
    message?: string;
}

export interface PaginatedResponse<T> {
    items: T[];
    total: number;
    page: number;
    limit: number;
}

// WebSocket event types
export interface WsMessage<T = unknown> {
    event: string;
    payload: T;
}
