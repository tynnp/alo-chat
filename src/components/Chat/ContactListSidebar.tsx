import { useRef, useEffect } from 'react';
import { Search, UserPlus } from 'lucide-react';

interface ContactListSidebarProps {
    onSelectContact: (id: number) => void;
    width: number;
    setWidth: (width: number) => void;
}

export default function ContactListSidebar({ onSelectContact, width, setWidth }: ContactListSidebarProps) {
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
            document.body.style.userSelect = 'auto';
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
            document.body.style.cursor = 'default';
            document.body.style.userSelect = 'auto';
        };
    }, [setWidth]);

    // Dữ liệu giả lập cho danh bạ
    const contacts = [
        { id: 1, name: 'Nguyễn Văn A', status: 'online', avatar: null },
        { id: 2, name: 'Trần Thị B', status: 'offline', avatar: null },
        { id: 3, name: 'Lê Văn C', status: 'online', avatar: null },
        { id: 4, name: 'Team Lead', status: 'away', avatar: null },
    ];

    const friendRequests = [
        { id: 101, name: 'Người Lạ 1', mutualFriends: 2 },
    ];

    return (
        <div
            className="h-full bg-white border-r border-gray-200 flex flex-col relative flex-shrink-0"
            style={{ width: `${width}px` }}
        >
            {/* Header */}
            <div className="h-16 px-4 border-b border-gray-200 flex items-center justify-between flex-shrink-0">
                <h2 className="text-xl font-bold text-gray-800">Danh bạ</h2>
                <button className="p-2 text-gray-400 hover:text-blue-500 bg-gray-50 hover:bg-blue-50 rounded-lg transition-all" title="Thêm bạn">
                    <UserPlus className="w-5 h-5" />
                </button>
            </div>

            {/* Search */}
            <div className="p-4 pt-2 pb-2">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Tìm người dùng..."
                        className="w-full pl-9 pr-4 py-2 bg-gray-100 border-none rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                    />
                </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
                {/* Friend Requests */}
                {friendRequests.length > 0 && (
                    <div className="mb-2">
                        <div className="px-4 py-2 text-xs font-semibold text-blue-600 uppercase tracking-wider bg-blue-50">
                            Lời mời kết bạn ({friendRequests.length})
                        </div>
                        <div className="p-2">
                            {friendRequests.map(req => (
                                <div key={req.id} className="p-3 bg-white border border-gray-100 rounded-xl mb-2 flex flex-col gap-2 shadow-sm">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-semibold">
                                            {req.name.charAt(0)}
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-gray-800 text-sm">{req.name}</h4>
                                            <p className="text-xs text-gray-500">{req.mutualFriends} bạn chung</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button className="flex-1 py-1.5 bg-blue-500 text-white text-xs font-medium rounded-lg hover:bg-blue-600 transition-colors">
                                            Đồng ý
                                        </button>
                                        <button className="flex-1 py-1.5 bg-gray-100 text-gray-600 text-xs font-medium rounded-lg hover:bg-gray-200 transition-colors">
                                            Từ chối
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Contacts A-Z */}
                <div className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Bạn bè ({contacts.length})
                </div>

                <div className="space-y-1 px-2">
                    {contacts.map(contact => (
                        <div
                            key={contact.id}
                            onClick={() => onSelectContact(contact.id)}
                            className="group p-3 flex items-center gap-3 rounded-xl hover:bg-blue-50 cursor-pointer transition-colors"
                        >
                            <div className="relative">
                                <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center font-semibold">
                                    {contact.name.charAt(0).toUpperCase()}
                                </div>
                                <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white
                                    ${contact.status === 'online' ? 'bg-green-500' :
                                        contact.status === 'away' ? 'bg-yellow-500' : 'bg-gray-400'}`}>
                                </div>
                            </div>

                            <div className="flex-1 min-w-0">
                                <h4 className="font-semibold text-gray-800 truncate">{contact.name}</h4>
                                <p className="text-xs text-gray-500">{contact.status === 'online' ? 'Đang hoạt động' : 'Offline'}</p>
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
