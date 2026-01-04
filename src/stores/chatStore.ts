import { create } from 'zustand';

export interface Message {
    id: string;
    clientId?: string;
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
    isPinned?: boolean;
    lastMessage?: Message;
    unreadCount: number;
    createdAt: Date;
}

interface ChatState {
    conversations: Conversation[];
    activeConversationId: string | null;
    messages: Record<string, Message[]>;
    typingUsers: Record<string, { userId: string; userName: string; timestamp: number }>;

    setConversations: (conversations: Conversation[]) => void;
    addConversation: (conversation: Conversation) => void;
    setActiveConversation: (id: string | null) => void;
    togglePinConversation: (id: string) => void;
    clearConversationMessages: (id: string) => void;
    removeConversation: (id: string) => void;

    setMessages: (conversationId: string, messages: Message[]) => void;
    addMessage: (conversationId: string, message: Message, shouldIncrementUnread?: boolean) => void;
    updateMessageStatus: (conversationId: string, messageId: string, status: Message['status']) => void;
    updateAllMessagesStatus: (conversationId: string, userId: string, status: Message['status']) => void;
    resolveOptimisticMessage: (conversationId: string, clientId: string, serverId: string) => void;

    setTypingUser: (conversationId: string, userId: string, userName: string) => void;
    clearTypingUser: (conversationId: string) => void;
}

export const useChatStore = create<ChatState>((set) => ({
    conversations: [],
    activeConversationId: null,
    messages: {},
    typingUsers: {},

    setConversations: (conversations) => set({ conversations }),

    addConversation: (conversation) =>
        set((state) => ({
            conversations: [conversation, ...state.conversations],
        })),

    setActiveConversation: (id) => set((state) => ({
        activeConversationId: id,
        conversations: state.conversations.map(c =>
            c.id === id ? { ...c, unreadCount: 0 } : c
        )
    })),

    togglePinConversation: (id) => set((state) => {
        const updated = state.conversations.map(c =>
            c.id === id ? { ...c, isPinned: !c.isPinned } : c
        );

        // Sắp xếp lại: ghim lên đầu
        updated.sort((a, b) => {
            if (a.isPinned && !b.isPinned) return -1;
            if (!a.isPinned && b.isPinned) return 1;
            return 0;
        });
        return { conversations: updated };
    }),

    clearConversationMessages: (id) => set((state) => ({
        messages: { ...state.messages, [id]: [] },
        conversations: state.conversations.map(c =>
            c.id === id ? { ...c, lastMessage: undefined } : c
        )
    })),

    removeConversation: (id) => set((state) => ({
        conversations: state.conversations.filter(c => c.id !== id),
        messages: Object.fromEntries(
            Object.entries(state.messages).filter(([key]) => key !== id)
        ),
        activeConversationId: state.activeConversationId === id ? null : state.activeConversationId
    })),

    setMessages: (conversationId, messages) =>
        set((state) => ({
            messages: { ...state.messages, [conversationId]: messages },
        })),

    addMessage: (conversationId, message, shouldIncrementUnread = false) =>
        set((state) => {
            const existingMessages = state.messages[conversationId] || [];
            if (existingMessages.some(m => m.id === message.id)) {
                return state;
            }

            return {
                messages: {
                    ...state.messages,
                    [conversationId]: [...existingMessages, message],
                },

                conversations: state.conversations.map(conv => {
                    if (conv.id !== conversationId) return conv;

                    return {
                        ...conv,
                        lastMessage: message,
                        unreadCount: shouldIncrementUnread ? conv.unreadCount + 1 : conv.unreadCount
                    };
                }),
            };
        }),

    updateMessageStatus: (conversationId: string, messageId: string, status) =>
        set((state) => ({
            messages: {
                ...state.messages,
                [conversationId]: (state.messages[conversationId] || []).map((msg) =>
                    msg.id === messageId ? { ...msg, status } : msg
                ),
            },
        })),

    updateAllMessagesStatus: (conversationId: string, userId: string, status) =>
        set((state) => ({
            messages: {
                ...state.messages,
                [conversationId]: (state.messages[conversationId] || []).map((msg) =>
                    msg.senderId !== userId ? { ...msg, status } : msg
                ),
            },
        })),

    resolveOptimisticMessage: (conversationId, clientId, serverId) =>
        set((state) => {
            const existingMessages = state.messages[conversationId] || [];

            const updatedMessages: Message[] = existingMessages.map((msg) =>
                msg.clientId === clientId ? { ...msg, id: serverId, status: 'sent' as const } : msg
            );

            return {
                messages: {
                    ...state.messages,
                    [conversationId]: updatedMessages,
                },

                conversations: state.conversations.map(conv => {
                    if (conv.id !== conversationId || !conv.lastMessage || conv.lastMessage.clientId !== clientId) {
                        return conv;
                    }
                    return {
                        ...conv,
                        lastMessage: { ...conv.lastMessage, id: serverId, status: 'sent' as const }
                    };
                }),
            };
        }),

    setTypingUser: (conversationId, userId, userName) =>
        set((state) => ({
            typingUsers: {
                ...state.typingUsers,
                [conversationId]: { userId, userName, timestamp: Date.now() }
            }
        })),

    clearTypingUser: (conversationId) =>
        set((state) => {
            const { [conversationId]: _, ...rest } = state.typingUsers;
            return { typingUsers: rest };
        }),
}));
