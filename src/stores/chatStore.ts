import { create } from 'zustand';

export interface Message {
    id: string;
    conversationId: string;
    senderId: string;
    content: string;
    type: 'text' | 'file' | 'image' | 'system';
    fileUrl?: string;
    fileName?: string;
    status: 'sending' | 'sent' | 'delivered' | 'read';
    createdAt: Date;
}

export interface Conversation {
    id: string;
    type: 'private' | 'group' | 'self';
    name?: string;
    members: string[];
    lastMessage?: Message;
    unreadCount: number;
    createdAt: Date;
}

interface ChatState {
    conversations: Conversation[];
    activeConversationId: string | null;
    messages: Record<string, Message[]>;

    setConversations: (conversations: Conversation[]) => void;
    addConversation: (conversation: Conversation) => void;
    setActiveConversation: (id: string | null) => void;

    setMessages: (conversationId: string, messages: Message[]) => void;
    addMessage: (conversationId: string, message: Message) => void;
    updateMessageStatus: (conversationId: string, messageId: string, status: Message['status']) => void;
}

export const useChatStore = create<ChatState>((set) => ({
    conversations: [],
    activeConversationId: null,
    messages: {},

    setConversations: (conversations) => set({ conversations }),

    addConversation: (conversation) =>
        set((state) => ({
            conversations: [conversation, ...state.conversations],
        })),

    setActiveConversation: (id) => set({ activeConversationId: id }),

    setMessages: (conversationId, messages) =>
        set((state) => ({
            messages: { ...state.messages, [conversationId]: messages },
        })),

    addMessage: (conversationId, message) =>
        set((state) => ({
            messages: {
                ...state.messages,
                [conversationId]: [...(state.messages[conversationId] || []), message],
            },
        })),

    updateMessageStatus: (conversationId, messageId, status) =>
        set((state) => ({
            messages: {
                ...state.messages,
                [conversationId]: (state.messages[conversationId] || []).map((msg) =>
                    msg.id === messageId ? { ...msg, status } : msg
                ),
            },
        })),
}));
