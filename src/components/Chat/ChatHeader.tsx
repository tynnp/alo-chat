import { Phone, Video, Info, Cloud } from 'lucide-react';

interface ChatHeaderProps {
    conversation: {
        id: number;
        name: string;
        avatar?: string | null;
        status?: string; // 'online' | 'offline'
        lastOnline?: string; // e.g., '5 phút trước'
        type: string; // 'private' | 'group' | 'self'
    };
}

export default function ChatHeader({ conversation }: ChatHeaderProps) {
    return (
        <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shadow-sm">
            {/* User Info */}
            <div className="flex items-center gap-4">
                <div className="relative">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-semibold
                        ${conversation.type === 'self' ? 'bg-indigo-100 text-indigo-600' :
                            conversation.type === 'group' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'}`}>
                        {conversation.type === 'self' ? <Cloud className="w-6 h-6" /> : conversation.name.charAt(0).toUpperCase()}
                    </div>

                    {/* Online Status Dot */}
                    {conversation.type === 'private' && (
                        <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white
                            ${conversation.status === 'online' ? 'bg-green-500' : 'bg-gray-400'}`}>
                        </div>
                    )}
                </div>

                <div className="flex flex-col">
                    <h3 className="font-bold text-gray-800 leading-tight">{conversation.name}</h3>
                    <p className="text-xs text-gray-500">
                        {conversation.type === 'private' ? (
                            conversation.status === 'online' ? 'Đang hoạt động' :
                                `Hoạt động ${conversation.lastOnline || 'gần đây'}`
                        ) : (
                            conversation.type === 'group' ? '3 thành viên' : 'Cloud của tôi'
                        )}
                    </p>
                </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1">
                <button className="p-2 text-blue-500 hover:bg-blue-50 rounded-full transition-all" title="Gọi thoại">
                    <Phone className="w-5 h-5" />
                </button>
                <button className="p-2 text-blue-500 hover:bg-blue-50 rounded-full transition-all" title="Gọi video">
                    <Video className="w-5 h-5" />
                </button>
                <div className="w-px h-6 bg-gray-200 mx-2"></div>
                <button className="p-2 text-gray-400 hover:text-blue-500 hover:bg-gray-50 rounded-full transition-all" title="Thông tin hội thoại">
                    <Info className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
}