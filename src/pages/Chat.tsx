import { useState, useEffect } from 'react';
import NavigationSidebar from '../components/Chat/NavigationSidebar';
import ChatListSidebar from '../components/Chat/ChatListSidebar';
import ContactListSidebar from '../components/Chat/ContactListSidebar';
import ChatHeader from '../components/Chat/ChatHeader';
import MessageList from '../components/Chat/MessageList';
import ChatInput from '../components/Chat/ChatInput';
import { MessagesSquare } from 'lucide-react';
import { useChatStore } from '../stores/chatStore';
import { useAuthStore } from '../stores/authStore';
import { useFriendStore } from '../stores/friendStore';
import { conversationsApi, type MessageResponse } from '../services/api';
import { socketService } from '../services/socket';

type ChatTab = 'chat' | 'contacts';

export default function Chat() {
    const [activeTab, setActiveTab] = useState<ChatTab>('chat');
    const [sidebarWidth, setSidebarWidth] = useState(320);

    const { token, user } = useAuthStore();
    const {
        conversations,
        activeConversationId,
        setActiveConversation,
        messages,
        setMessages
    } = useChatStore();
    const { friends } = useFriendStore();

    // Lấy conversation hiện tại
    const activeConversation = conversations.find(c => c.id === activeConversationId);
    const currentMessages = activeConversationId ? messages[activeConversationId] || [] : [];

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
        if (!token) return;

        // Tìm hoặc tạo cuộc hội thoại với người bạn này
        try {
            const response = await conversationsApi.create(token, {
                type: 'private',
                member_ids: [friendId]
            });

            setActiveTab('chat');
            setActiveConversation(response._id);
        } catch (error) {
            console.error('Failed to create conversation:', error);
            alert((error as Error).message);
        }
    };

    const handleSendMessage = async (content: string) => {
        if (!activeConversationId) return;

        try {
            await socketService.sendMessage(activeConversationId, content);
        } catch (error) {
            console.error('Failed to send message:', error);
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
                memberCount: activeConversation.members.length,
            };
        }

        // Chat cá nhân - tìm tên người nhận
        const otherId = activeConversation.members.find(id => id !== user?.id);
        const friend = friends.find(f => f.id === otherId);

        return {
            name: friend?.displayName || activeConversation.name || 'Người dùng',
            type: 'private' as const,
            status: friend?.status || 'offline',
            lastOnline: '5 phút trước',
        };
    };

    const displayInfo = getConversationDisplayInfo();

    return (
        <div className="flex h-screen bg-gray-100 overflow-hidden">
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
            <div className="flex-1 flex flex-col bg-gray-50">
                {activeConversation && displayInfo ? (
                    <div className="flex-1 flex flex-col">
                        {/* Chat Header */}
                        <ChatHeader conversation={{
                            id: activeConversation.id,
                            name: displayInfo.name,
                            type: displayInfo.type,
                            status: 'status' in displayInfo ? displayInfo.status : undefined,
                            lastOnline: 'lastOnline' in displayInfo ? displayInfo.lastOnline : undefined,
                            memberCount: 'memberCount' in displayInfo ? displayInfo.memberCount : undefined,
                        }} />

                        {/* Message List */}
                        <MessageList
                            messages={currentMessages.map(msg => ({
                                id: msg.id,
                                content: msg.content,
                                senderId: msg.senderId,
                                timestamp: new Date(msg.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
                                type: msg.type as 'text' | 'image' | 'file',
                                status: msg.status === 'read' ? 'read' : msg.status === 'delivered' ? 'received' : 'sent',
                            }))}
                            currentUserId={user?.id || ''}
                        />

                        {/* Input Area */}
                        <ChatInput onSendMessage={handleSendMessage} />
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
