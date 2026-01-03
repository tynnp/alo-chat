import { MessagesSquare, Users, Settings, LogOut } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { useChatStore } from '../../stores/chatStore';
import { socketService } from '../../services/socket';

interface NavigationSidebarProps {
    activeTab: 'chat' | 'contacts';
    setActiveTab: (tab: 'chat' | 'contacts') => void;
}

export default function NavigationSidebar({ activeTab, setActiveTab }: NavigationSidebarProps) {
    const { user, logout } = useAuthStore();
    const { conversations } = useChatStore();
    const totalUnread = conversations.reduce((sum, conv) => sum + conv.unreadCount, 0);

    return (
        <div className="w-16 h-full bg-blue-50 border-r border-blue-100 flex flex-col items-center py-2 justify-between">
            <div className="flex flex-col items-center gap-1 w-full">
                {/* User Avatar */}
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold mb-1 border border-blue-200">
                    {user?.displayName?.charAt(0).toUpperCase() || 'U'}
                </div>

                {/* Tabs */}
                <button
                    onClick={() => setActiveTab('chat')}
                    className={`p-2 rounded-xl transition-all relative ${activeTab === 'chat'
                        ? 'bg-blue-500 text-white shadow-md shadow-blue-500/20'
                        : 'text-gray-500 hover:bg-blue-100 hover:text-blue-600'
                        }`}
                    title="Messages"
                >
                    <MessagesSquare className="w-5 h-5" />
                    {totalUnread > 0 && (
                        <div className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-blue-50"></div>
                    )}
                </button>

                <button
                    onClick={() => setActiveTab('contacts')}
                    className={`p-2 rounded-xl transition-all ${activeTab === 'contacts'
                        ? 'bg-blue-500 text-white shadow-md shadow-blue-500/20'
                        : 'text-gray-500 hover:bg-blue-100 hover:text-blue-600'
                        }`}
                    title="Contacts"
                >
                    <Users className="w-5 h-5" />
                </button>
            </div>

            <div className="flex flex-col items-center gap-1 w-full mb-1">
                <button className="p-2 text-gray-500 hover:bg-blue-100 hover:text-blue-600 rounded-xl transition-all" title="Settings">
                    <Settings className="w-5 h-5" />
                </button>
                <button
                    onClick={() => {
                        socketService.disconnect();
                        logout();
                    }}
                    className="p-2 text-gray-500 hover:bg-red-50 hover:text-red-500 rounded-xl transition-all"
                    title="Logout"
                >
                    <LogOut className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
}