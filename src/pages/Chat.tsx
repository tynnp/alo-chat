import { useState, useEffect, useMemo } from 'react';
import NavigationSidebar from '../components/Chat/NavigationSidebar';
import ChatListSidebar from '../components/Chat/ChatListSidebar';
import ContactListSidebar from '../components/Chat/ContactListSidebar';
import ChatHeader from '../components/Chat/ChatHeader';
import MessageList from '../components/Chat/MessageList';
import ChatInput from '../components/Chat/ChatInput';
import TypingIndicator from '../components/Chat/TypingIndicator';
import { MessagesSquare } from 'lucide-react';
import { useChatStore, type Message } from '../stores/chatStore';
import { useAuthStore } from '../stores/authStore';
import { useFriendStore } from '../stores/friendStore';
import { conversationsApi, filesApi, type MessageResponse } from '../services/api';
import { socketService } from '../services/socket';
import { listen } from '@tauri-apps/api/event';
import { getCurrentWebviewWindow } from '@tauri-apps/api/webviewWindow';

type ChatTab = 'chat' | 'contacts';

function formatRelativeTime(date?: Date): string | undefined {
    if (!date) return undefined;
    const diff = Math.max(0, Date.now() - date.getTime());
    const minutes = Math.floor(diff / 60000);

    if (minutes < 1) return 'vừa xong';
    if (minutes < 60) return `${minutes} phút trước`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} giờ trước`;

    return `vào ${date.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    })}`;
}

export default function Chat() {
    const [activeTab, setActiveTab] = useState<ChatTab>('chat');
    const [sidebarWidth, setSidebarWidth] = useState(320);

    const { token, user } = useAuthStore();
    const {
        conversations,
        activeConversationId,
        setActiveConversation,
        addConversation,
        messages,
        setMessages,
        addMessage
    } = useChatStore();
    const { friends } = useFriendStore();

    // Lấy conversation hiện tại
    const activeConversation = conversations.find(c => c.id === activeConversationId);
    const currentMessages = activeConversationId ? messages[activeConversationId] || [] : [];

    useEffect(() => {
        if (!activeConversationId || !user) return;

        const hasUnread = currentMessages.some(m => m.senderId !== user.id && m.status !== 'read');

        if (hasUnread) {
            // Sử dụng batch read receipts để tối ưu hiệu suất
            socketService.markConversationAsRead(activeConversationId);
        }
    }, [activeConversationId, currentMessages.length, user?.id]);

    useEffect(() => {
        const unlisten = listen<{ conversationId: string }>('open-conversation', async (event) => {
            const { conversationId } = event.payload;

            // Đưa app lên trên cùng
            try {
                const win = getCurrentWebviewWindow();
                await win.unminimize();
                await win.maximize();
                await win.show();
                await win.setFocus();
            } catch (err) { }

            if (conversationId) {
                setActiveTab('chat');
                setActiveConversation(conversationId);
            }
        });

        return () => {
            unlisten.then(f => f());
        };
    }, []);

    useEffect(() => {
        const unlisten = listen('open-contacts', async () => {
            try {
                const win = getCurrentWebviewWindow();
                await win.unminimize();
                await win.maximize();
                await win.show();
                await win.setFocus();
            } catch (err) { }

            setActiveTab('contacts');
        });

        return () => {
            unlisten.then(f => f());
        };
    }, []);

    // Tải tin nhắn khi chọn cuộc hội thoại
    useEffect(() => {
        if (!activeConversationId || !token) return;

        const fetchMessages = async () => {
            try {
                const response = await conversationsApi.getMessages(token, activeConversationId);
                const msgs = response.messages.map((msg: MessageResponse) => ({
                    id: msg._id,
                    conversationId: msg.conversation_id,
                    senderId: msg.sender_id,
                    content: msg.content,
                    type: msg.type,
                    fileUrl: msg.file_url,
                    fileName: msg.file_name,
                    status: msg.status[0]?.status || 'sent',
                    createdAt: new Date(msg.created_at),
                }));
                setMessages(activeConversationId, msgs);
            } catch (error) {
                console.error('Failed to fetch messages:', error);
            }
        };

        fetchMessages();
    }, [activeConversationId, token]);

    const handleSelectConversation = (id: string) => {
        setActiveConversation(id);
    };

    const handleSelectContact = async (friendId: string) => {
        if (!token || !user) return;

        // Tìm hoặc tạo cuộc hội thoại với người bạn này
        try {
            const response = await conversationsApi.create(token, {
                type: 'private',
                member_ids: [friendId]
            });

            const existingConv = conversations.find(c => c.id === response._id);

            if (!existingConv) {
                addConversation({
                    id: response._id,
                    type: response.type,
                    name: response.name,
                    members: response.members.map(m => m.user_id),
                    unreadCount: 0,
                    createdAt: new Date(response.created_at),
                });
            }

            setActiveTab('chat');
            setActiveConversation(response._id);
        } catch (error) {
            console.error('Failed to create conversation:', error);
            alert((error as Error).message);
        }
    };

    const handleSendMessage = async (content: string, type: 'text' | 'file' | 'image' = 'text', fileUrl?: string, fileName?: string) => {
        if (!activeConversationId || !user) return;

        const clientId = Date.now().toString() + Math.random().toString(36).substring(7);

        const optimisticMessage: Message = {
            id: clientId,
            clientId,
            conversationId: activeConversationId,
            senderId: user.id,
            content: content,
            type: type,
            fileUrl: fileUrl,
            fileName: fileName,
            status: 'sending',
            createdAt: new Date(),
        };

        addMessage(activeConversationId, optimisticMessage);

        try {
            await socketService.sendMessage(activeConversationId, content, type, clientId, fileUrl, fileName);
        } catch (error) {
            console.error('Failed to send message:', error);
        }
    };

    const handleFileUpload = async (file: File) => {
        if (!token) return null;
        try {
            const result = await filesApi.upload(token, file);
            return result;
        } catch (error) {
            console.error('File upload failed:', error);
            return null;
        }
    };

    // Lấy thông tin hiển thị của cuộc hội thoại
    const getConversationDisplayInfo = () => {
        if (!activeConversation) return null;

        if (activeConversation.type === 'self') {
            return {
                name: 'Cloud của tôi',
                type: 'self' as const,
                status: 'online' as const,
            };
        }

        if (activeConversation.type === 'group') {
            return {
                name: activeConversation.name || 'Nhóm chat',
                type: 'group' as const,
                avatarUrl: undefined,
                memberCount: activeConversation.members.length,
            };
        }

        // Chat cá nhân - tìm tên người nhận
        const otherId = activeConversation.members.find(id => id !== user?.id);
        const friend = friends.find(f => f.id === otherId);

        return {
            name: friend?.displayName || activeConversation.name || 'Người dùng',
            type: 'private' as const,
            avatarUrl: friend?.avatarUrl,
            status: friend?.status || 'offline',
            lastOnline: formatRelativeTime(friend?.lastOnline),
        };
    };

    const displayInfo = getConversationDisplayInfo();

    const mappedMessages = useMemo(() => currentMessages.map(msg => {
        const isOwn = msg.senderId === user?.id;
        const sender = isOwn ? user : friends.find(f => f.id === msg.senderId);
        return {
            id: msg.id,
            content: msg.content,
            senderId: msg.senderId,
            senderAvatar: sender?.avatarUrl,
            senderName: sender?.displayName,
            timestamp: new Date(msg.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
            type: msg.type as 'text' | 'image' | 'file',
            fileUrl: msg.fileUrl,
            fileName: msg.fileName,
            status: (msg.status === 'read' ? 'read' : msg.status === 'delivered' ? 'received' : msg.status === 'sending' ? 'sending' : 'sent') as 'sending' | 'sent' | 'received' | 'read',
        };
    }), [currentMessages, user, friends]);

    return (
        <div className="flex h-full bg-gray-100 overflow-hidden">
            {/* 1. Navigation Sidebar (Icons) */}
            <NavigationSidebar activeTab={activeTab} setActiveTab={setActiveTab} />

            {/* 2. Secondary Sidebar (List) */}
            {activeTab === 'chat' ? (
                <ChatListSidebar
                    onSelectConversation={handleSelectConversation}
                    width={sidebarWidth}
                    setWidth={setSidebarWidth}
                />
            ) : (
                <ContactListSidebar
                    onSelectContact={handleSelectContact}
                    width={sidebarWidth}
                    setWidth={setSidebarWidth}
                />
            )}

            {/* 3. Main Chat Area */}
            <div className="flex-1 flex flex-col bg-gray-50 min-h-0">
                {activeConversation && displayInfo ? (
                    <div className="flex-1 flex flex-col min-h-0">
                        {/* Chat Header */}
                        <ChatHeader conversation={{
                            id: activeConversation.id,
                            name: displayInfo.name,
                            avatar: displayInfo.avatarUrl,
                            type: displayInfo.type,
                            status: 'status' in displayInfo ? displayInfo.status : undefined,
                            lastOnline: 'lastOnline' in displayInfo ? displayInfo.lastOnline : undefined,
                            memberCount: 'memberCount' in displayInfo ? displayInfo.memberCount : undefined,
                        }} />

                        {/* Message List */}
                        <MessageList
                            messages={mappedMessages}
                            currentUserId={user?.id || ''}
                            conversationType={activeConversation?.type}
                            conversationId={activeConversationId || undefined}
                        />

                        {/* Typing Indicator */}
                        <TypingIndicator conversationId={activeConversationId} />

                        {/* Input Area */}
                        <ChatInput onSendMessage={handleSendMessage} onFileUpload={handleFileUpload} conversationId={activeConversationId ?? undefined} />
                    </div>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                        <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mb-4">
                            <MessagesSquare className="w-12 h-12 text-gray-400" />
                        </div>
                        <p className="text-lg font-medium text-gray-500">Chào mừng đến với ALO Chat</p>
                        <p className="text-sm mt-2 max-w-md text-center">Nâng tầm hiệu suất với không gian làm việc chuyên nghiệp, tối ưu hoàn hảo cho máy tính của bạn</p>
                    </div>
                )}
            </div>
        </div>
    );
}
