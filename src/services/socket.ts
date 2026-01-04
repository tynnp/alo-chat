import { useSocketStore } from '../stores/socketStore';
import { useAuthStore } from '../stores/authStore';
import { useChatStore, type Message, type Conversation } from '../stores/chatStore';
import { useFriendStore, type Friend, type FriendRequest } from '../stores/friendStore';
import { useNotificationStore } from '../stores/notificationStore';
import { API_BASE_URL, conversationsApi } from './api';

const WS_URL = import.meta.env.VITE_WS_URL || API_BASE_URL.replace('http', 'ws').replace(/\/$/, '') + '/ws';

let ws: WebSocket | null = null;
let currentToken: string | null = null;
let connectionPromise: Promise<void> | null = null;
let messageQueue: { event: string; data: unknown }[] = [];
let heartbeatInterval: ReturnType<typeof setInterval> | null = null;

export const socketService = {
    connect: async (token: string) => {
        const socketStore = useSocketStore.getState();

        if (ws) {
            if (ws.readyState === WebSocket.CONNECTING || ws.readyState === WebSocket.OPEN) {
                if (currentToken === token) {
                    return connectionPromise || Promise.resolve();
                }
                ws.close();
            }

            if (ws.readyState === WebSocket.CLOSING || ws.readyState === WebSocket.CLOSED) {
                ws = null;
            }
        }

        if (ws) {
            ws.close();
            ws = null;
        }

        currentToken = token;
        socketStore.setConnecting(true);

        connectionPromise = new Promise<void>((resolve, reject) => {
            try {
                ws = new WebSocket(`${WS_URL}?token=${token}`);

                ws.onopen = () => {
                    socketStore.setConnected(true);
                    socketService.startHeartbeat();

                    while (messageQueue.length > 0) {
                        const msg = messageQueue.shift();
                        if (msg) socketService.send(msg.event, msg.data);
                    }

                    resolve();
                };

                ws.onmessage = (event) => {
                    try {
                        const data = JSON.parse(event.data);
                        handleMessage(data);
                    } catch (e) {
                    }
                };

                ws.onerror = () => {
                    if (ws && ws.readyState === WebSocket.OPEN) {
                    } else {
                        socketStore.setError('WebSocket connection error');
                        connectionPromise = null;
                    }
                };

                ws.onclose = () => {
                    socketStore.setConnected(false);
                    socketService.stopHeartbeat();
                    ws = null;
                    connectionPromise = null;

                    // Tự động kết nối lại nếu bị ngắt kết nối không mong muốn
                    if (currentToken === token) {
                        setTimeout(() => {
                            if (currentToken === token) {
                                socketService.connect(token).catch(() => { });
                            }
                        }, 1000);
                    }
                };
            } catch (error) {
                socketStore.setError((error as Error).message);
                connectionPromise = null;
                reject(error);
            }
        });

        return connectionPromise;
    },

    disconnect: async () => {
        currentToken = null;
        connectionPromise = null;
        socketService.stopHeartbeat();

        if (ws) {
            ws.close();
            ws = null;
        }
        useSocketStore.getState().setConnected(false);
    },

    startHeartbeat: () => {
        if (heartbeatInterval) clearInterval(heartbeatInterval);
        heartbeatInterval = setInterval(() => {
            if (ws && ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify({ event: 'ping', data: {} }));
            }
        }, 10000);
    },

    stopHeartbeat: () => {
        if (heartbeatInterval) {
            clearInterval(heartbeatInterval);
            heartbeatInterval = null;
        }
    },

    send: async (event: string, data: unknown) => {
        if (ws && ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ event, data }));
        } else {
            if (currentToken && (!ws || ws.readyState === WebSocket.CLOSED)) {
                socketService.connect(currentToken).catch(() => { });
            }
        }
    },

    sendMessage: async (conversationId: string, content: string, type: 'text' | 'file' | 'image' = 'text', clientId?: string, fileUrl?: string, fileName?: string) => {
        await socketService.send('message:send', { conversationId, content, type, clientId, fileUrl, fileName });
    },

    sendTyping: async (conversationId: string) => {
        await socketService.send('user:typing', { conversationId });
    },

    markAsRead: async (conversationId: string, messageId: string) => {
        await socketService.send('message:read', { conversationId, messageId });
    },

    markConversationAsRead: async (conversationId: string) => {
        await socketService.send('message:read_all', { conversationId });
    },

    isConnected: () => {
        return ws !== null && ws.readyState === WebSocket.OPEN;
    },
};

interface BackendMessage {
    _id: string;
    clientId?: string;
    conversation_id: string;
    sender_id: string;
    sender_name?: string;
    sender_avatar?: string;
    content: string;
    type: 'text' | 'file' | 'image' | 'system';
    file_url?: string;
    file_name?: string;
    status: Array<{ user_id: string; status: string; at: string }>;
    created_at: string;
}

interface BackendFriendInfo {
    id: string;
    username: string;
    display_name: string;
    avatar_url?: string;
    status: 'online' | 'offline';
}

const processedMessages = new Set<string>();

async function handleMessage(data: { event: string; payload: unknown }) {
    const chatStore = useChatStore.getState();
    const friendStore = useFriendStore.getState();
    const authStore = useAuthStore.getState();

    switch (data.event) {
        case 'message:new': {
            const backendMsg = data.payload as BackendMessage;

            if (processedMessages.has(backendMsg._id)) return;
            processedMessages.add(backendMsg._id);

            if (processedMessages.size > 100) {
                const first = processedMessages.values().next().value;
                if (first) processedMessages.delete(first);
            }

            if (backendMsg.clientId && backendMsg.sender_id === authStore.user?.id) {
                chatStore.resolveOptimisticMessage(backendMsg.conversation_id, backendMsg.clientId, backendMsg._id);
                return;
            }

            const message: Message = {
                id: backendMsg._id,
                conversationId: backendMsg.conversation_id,
                senderId: backendMsg.sender_id,
                content: backendMsg.content,
                type: backendMsg.type,
                fileUrl: backendMsg.file_url,
                fileName: backendMsg.file_name,
                status: backendMsg.status[0]?.status as Message['status'] || 'sent',
                createdAt: new Date(backendMsg.created_at),
            };

            const currentUserId = authStore.user?.id;
            const isOwnMessage = message.senderId === currentUserId;
            const existingConv = chatStore.conversations.find(c => c.id === message.conversationId);
            let isNewConversation = false;

            if (!existingConv) {
                isNewConversation = true;
                const token = authStore.token;

                if (token) {
                    try {
                        const response = await conversationsApi.getAll(token);
                        const newConv = response.conversations.find(c => c._id === message.conversationId);
                        if (newConv) {
                            const conversation: Conversation = {
                                id: newConv._id,
                                type: newConv.type,
                                name: newConv.name,
                                members: newConv.members.map(m => m.user_id),
                                isPinned: false,
                                unreadCount: isOwnMessage ? 0 : 1,
                                createdAt: new Date(newConv.created_at),
                                lastMessage: message,
                            };
                            chatStore.addConversation(conversation);
                        }
                    } catch (error) {
                        console.error('Failed to fetch new conversation:', error);
                    }
                }
            }

            const isInactiveConversation = chatStore.activeConversationId !== message.conversationId;
            const shouldIncrementUnread = !isOwnMessage && isInactiveConversation && !isNewConversation;

            chatStore.addMessage(message.conversationId, message, shouldIncrementUnread);

            const isAppFocused = document.hasFocus();
            const shouldShowNotification = !isOwnMessage && (isInactiveConversation || !isAppFocused);

            if (shouldShowNotification) {
                const notificationStore = useNotificationStore.getState();
                notificationStore.addNotification({
                    senderName: backendMsg.sender_name || 'Người dùng',
                    senderAvatar: backendMsg.sender_avatar,
                    content: backendMsg.content,
                    conversationId: backendMsg.conversation_id,
                });
            }
            break;
        }
        case 'message:status': {
            const { conversationId, messageId, status } = data.payload as {
                conversationId: string;
                messageId: string;
                status: Message['status'];
            };
            chatStore.updateMessageStatus(conversationId, messageId, status);
            break;
        }
        case 'message:read_all': {
            const { conversationId, userId } = data.payload as {
                conversationId: string;
                userId: string;
            };

            chatStore.updateAllMessagesStatus(conversationId, userId, 'read');
            break;
        }
        case 'conversation:deleted': {
            const { conversationId } = data.payload as {
                conversationId: string;
                deletedBy: string;
            };

            chatStore.removeConversation(conversationId);
            break;
        }
        case 'user:status': {
            const { userId, status, lastOnline } = data.payload as { userId: string; status: 'online' | 'offline'; lastOnline?: string };

            const friends = friendStore.friends.map(f =>
                f.id === userId ? {
                    ...f,
                    status,
                    lastOnline: lastOnline ? new Date(lastOnline) : f.lastOnline
                } : f
            );

            friendStore.setFriends(friends);
            break;
        }

        case 'friend:request_received': {
            const reqPayload = data.payload as {
                id: string;
                from_user_id: string;
                from_user_name: string;
                from_user_avatar?: string;
                status: 'pending';
                created_at: string;
            };

            const newRequest: FriendRequest = {
                id: reqPayload.id,
                fromUserId: reqPayload.from_user_id,
                fromUserName: reqPayload.from_user_name,
                fromUserAvatar: reqPayload.from_user_avatar,
                toUserId: '',
                toUserName: '',
                status: 'pending',
                createdAt: new Date(reqPayload.created_at),
            };

            friendStore.addFriendRequest(newRequest);
            const notificationStore = useNotificationStore.getState();

            notificationStore.addNotification({
                senderName: reqPayload.from_user_name,
                senderAvatar: reqPayload.from_user_avatar,
                content: 'đã gửi lời mời kết bạn',
                conversationId: `friend_request:${reqPayload.id}`,
            });
            break;
        }

        case 'friend:request_accepted': {
            const { request_id, new_friend } = data.payload as {
                request_id: string;
                new_friend: BackendFriendInfo;
            };

            friendStore.removeSentRequest(request_id);

            const friend: Friend = {
                id: new_friend.id,
                username: new_friend.username,
                displayName: new_friend.display_name,
                avatarUrl: new_friend.avatar_url,
                status: new_friend.status,
            };

            friendStore.addFriend(friend);
            break;
        }
    }
}