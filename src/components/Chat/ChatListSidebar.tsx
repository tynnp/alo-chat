import { useState, useEffect, useRef } from 'react';
import { Search, PlusCircle, Cloud } from 'lucide-react';

interface ChatListSidebarProps {
    onSelectConversation: (id: number) => void;
    width: number;
    setWidth: (width: number) => void;
}

export default function ChatListSidebar({ onSelectConversation, width, setWidth }: ChatListSidebarProps) {
    const isResizing = useRef(false);

    // Xử lý thay đổi kích thước
    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!isResizing.current) return;

            // Giới hạn độ rộng từ 260px đến 450px
            const newWidth = Math.max(260, Math.min(450, e.clientX - 64)); // 64px là độ rộng NavSidebar
            setWidth(newWidth);
        };

        const handleMouseUp = () => {
            isResizing.current = false;
            document.body.style.cursor = 'default';
            document.body.style.userSelect = 'auto'; // Khôi phục chọn văn bản
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
            document.body.style.cursor = 'default';
            document.body.style.userSelect = 'auto';
        };
    }, []);

    // Dữ liệu giả cho các cuộc trò chuyện
    const conversations = [
        { id: 1, name: 'Cloud của tôi', lastMessage: 'File: tailwind.config.js', time: '10:30', unread: 0, avatar: null, type: 'self' },
        { id: 2, name: 'Team Dev', lastMessage: 'Họp lúc 2h chiều nhé', time: '09:15', unread: 3, avatar: null, type: 'group' },
        { id: 3, name: 'Nguyễn Văn A', lastMessage: 'Ok, đã nhận được mail', time: 'Hôm qua', unread: 0, avatar: null, type: 'private' },
    ];

    return (
        <div
            className="h-full bg-white border-r border-gray-200 flex flex-col relative flex-shrink-0"
            style={{ width: `${width}px` }}
        >
            {/* Header */}
            <div className="h-16 px-4 border-b border-gray-200 flex items-center justify-between flex-shrink-0">
                <h2 className="text-xl font-bold text-gray-800">Trò chuyện</h2>
                <button className="p-2 text-gray-400 hover:text-blue-500 bg-gray-50 hover:bg-blue-50 rounded-lg transition-all">
                    <PlusCircle className="w-5 h-5" />
                </button>
            </div>

            {/* Search */}
            <div className="p-4 pt-2 pb-2">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Tìm kiếm cuộc trò chuyện..."
                        className="w-full pl-9 pr-4 py-2 bg-gray-100 border-none rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                    />
                </div>
            </div>

            {/* Conversation List */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
                <div className="space-y-1 px-2 pt-2">
                    {conversations.map(conv => (
                        <div
                            key={conv.id}
                            onClick={() => onSelectConversation(conv.id)}
                            className="group p-3 flex items-center gap-3 rounded-xl hover:bg-blue-50 cursor-pointer transition-colors"
                        >
                            <div className="relative">
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-semibold
                                    ${conv.type === 'self' ? 'bg-indigo-100 text-indigo-600' :
                                        conv.type === 'group' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'}`}>
                                    {conv.type === 'self' ? <Cloud className="w-6 h-6" /> : conv.name.charAt(0).toUpperCase()}
                                </div>
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-1">
                                    <h4 className="font-semibold text-gray-800 truncate">{conv.name}</h4>
                                    <span className="text-xs text-gray-400 whitespace-nowrap">{conv.time}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <p className={`text-sm truncate mr-4 ${conv.unread > 0 ? 'text-gray-800 font-medium' : 'text-gray-500'}`}>
                                        {conv.lastMessage}
                                    </p>
                                    {conv.unread > 0 && (
                                        <div className="w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center flex-shrink-0">
                                            {conv.unread}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Resize Handle */}
            <div
                className="absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-gray-300 transition-colors opacity-0 hover:opacity-100 z-50"
                onMouseDown={() => {
                    isResizing.current = true;
                    document.body.style.cursor = 'col-resize';
                    document.body.style.userSelect = 'none'; // Chặn chọn văn bản
                }}
            />
        </div>
    );
}
