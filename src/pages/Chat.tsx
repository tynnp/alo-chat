import { useState } from 'react';
import NavigationSidebar from '../components/Chat/NavigationSidebar';
import ChatListSidebar from '../components/Chat/ChatListSidebar';
import ContactListSidebar from '../components/Chat/ContactListSidebar';
import ChatHeader from '../components/Chat/ChatHeader';
import MessageList from '../components/Chat/MessageList';
import ChatInput from '../components/Chat/ChatInput';
import { MessagesSquare } from 'lucide-react';

type ChatTab = 'chat' | 'contacts';

export default function Chat() {
    const [activeTab, setActiveTab] = useState<ChatTab>('chat');
    const [selectedConversationId, setSelectedConversationId] = useState<number | null>(null);
    const [sidebarWidth, setSidebarWidth] = useState(320);

    const handleSelectConversation = (id: number) => {
        setSelectedConversationId(id);
        // Logic tải thông tin cuộc trò chuyện
    };

    const handleSelectContact = (id: number) => {
        // Hiện tại chuyển sang tab chat và giả lập mở cuộc trò chuyện
        console.log(`Starting chat with contact ${id}`);
        setActiveTab('chat');

        // Trong ứng dụng thực tế, sẽ tìm hoặc tạo ID cuộc trò chuyện cho liên hệ này
        // setSelectedConversationId(newConversationId);
    };

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
                {selectedConversationId ? (
                    <div className="flex-1 flex flex-col">
                        {/* Chat Header */}
                        <ChatHeader conversation={{
                            id: selectedConversationId,
                            name: selectedConversationId === 1 ? 'Cloud của tôi' : (selectedConversationId === 2 ? 'Team Dev' : 'Nguyễn Văn A'),
                            type: selectedConversationId === 1 ? 'self' : (selectedConversationId === 2 ? 'group' : 'private'),
                            status: selectedConversationId === 3 ? 'online' : 'offline',
                            lastOnline: '5 phút trước'
                        }} />

                        {/* Message List */}
                        <MessageList
                            messages={(
                                selectedConversationId === 1 ? [
                                    { id: 1, content: 'Lưu file cấu hình tailwind.config.js vào đây nhé', senderId: 999, timestamp: '10:28', type: 'text', status: 'read' },
                                    { id: 2, content: 'File: tailwind.config.js', senderId: 999, timestamp: '10:30', type: 'file', status: 'read' },
                                ] :
                                    selectedConversationId === 2 ? [
                                        { id: 1, content: 'Mọi người báo cáo tiến độ nhé', senderId: 3, timestamp: '09:00', type: 'text' },
                                        { id: 2, content: 'Frontend đã xong UI login', senderId: 999, timestamp: '09:10', type: 'text', status: 'read' },
                                        { id: 3, content: 'Họp lúc 2h chiều nhé', senderId: 3, timestamp: '09:15', type: 'text' },
                                    ] :
                                        [
                                            { id: 1, content: 'Xin chào! Dự án thế nào rồi?', senderId: 2, timestamp: '09:30 Hôm qua', type: 'text' },
                                            { id: 2, content: 'Mọi thứ vẫn đang đúng tiến độ, check mail nhé', senderId: 999, timestamp: '09:45 Hôm qua', type: 'text', status: 'read' },
                                            { id: 3, content: 'Ok, đã nhận được mail', senderId: 2, timestamp: '10:00 Hôm qua', type: 'text' },
                                        ]
                            )}
                            currentUserId={999} // ID người dùng giả lập
                        />

                        {/* Input Area */}
                        <ChatInput onSendMessage={(msg) => console.log('Sending:', msg)} />
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
