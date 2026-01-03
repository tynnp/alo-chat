import { useRef, useEffect, useState } from 'react';
import { Search, PlusCircle, CloudSync, Pin, Trash2 } from 'lucide-react';
import { useChatStore, type Conversation } from '../../stores/chatStore';
import { useAuthStore } from '../../stores/authStore';
import { useFriendStore } from '../../stores/friendStore';
import { API_BASE_URL, conversationsApi } from '../../services/api';
import ContextMenu from './ContextMenu';
import ConfirmModal from './ConfirmModal';

interface ChatListSidebarProps {
    onSelectConversation: (id: string) => void;
    width: number;
    setWidth: (width: number) => void;
}

interface ContextMenuState {
    x: number;
    y: number;
    conversation: Conversation | null;
}

interface ConfirmModalState {
    isOpen: boolean;
    title: string;
    message: string;
    action: 'clearMessages' | 'deleteConversation' | null;
    conversationId: string | null;
}

export default function ChatListSidebar({ onSelectConversation, width, setWidth }: ChatListSidebarProps) {
    const isResizing = useRef(false);
    const { conversations, activeConversationId, togglePinConversation, clearConversationMessages, removeConversation } = useChatStore();
    const { user, token } = useAuthStore();
    const { friends } = useFriendStore();
    const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);
    const [confirmModal, setConfirmModal] = useState<ConfirmModalState>({
        isOpen: false,
        title: '',
        message: '',
        action: null,
        conversationId: null,
    });

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

    const getConversationDisplay = (conv: typeof conversations[0]) => {
        if (conv.type === 'self') {
            return {
                name: 'Cloud của tôi',
                lastMessage: conv.lastMessage?.content || 'Lưu trữ cá nhân',
                avatar: null,
                type: 'self' as const,
            };
        }

        if (conv.type === 'group') {
            return {
                name: conv.name || 'Nhóm chat',
                lastMessage: conv.lastMessage?.content || 'Chưa có tin nhắn',
                avatar: null,
                type: 'group' as const,
            };
        }

        // Private chat - tìm người còn lại
        const otherId = conv.members.find(id => id !== user?.id);
        const friend = friends.find(f => f.id === otherId);

        return {
            name: friend?.displayName || conv.name || 'Người dùng',
            lastMessage: conv.lastMessage?.content || 'Chưa có tin nhắn',
            avatar: friend?.avatarUrl || null,
            type: 'private' as const,
        };
    };

    // Format thời gian
    const formatTime = (date?: Date) => {
        if (!date) return '';
        const now = new Date();
        const diff = now.getTime() - new Date(date).getTime();
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));

        if (days === 0) {
            return new Date(date).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
        } else if (days === 1) {
            return 'Hôm qua';
        } else if (days < 7) {
            return `${days} ngày trước`;
        } else {
            return new Date(date).toLocaleDateString('vi-VN');
        }
    };

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
                    {conversations.length === 0 ? (
                        <div className="text-center py-8 text-gray-400">
                            <p className="text-sm">Chưa có cuộc trò chuyện nào</p>
                            <p className="text-xs mt-1">Hãy kết bạn và bắt đầu trò chuyện!</p>
                        </div>
                    ) : (
                        conversations.map(conv => {
                            const display = getConversationDisplay(conv);
                            const isActive = conv.id === activeConversationId;

                            return (
                                <div
                                    key={conv.id}
                                    onClick={() => onSelectConversation(conv.id)}
                                    onContextMenu={(e) => {
                                        e.preventDefault();
                                        setContextMenu({ x: e.clientX, y: e.clientY, conversation: conv });
                                    }}
                                    className={`group p-3 flex items-center gap-3 rounded-xl cursor-pointer transition-colors
                                        ${isActive ? 'bg-blue-100' : 'hover:bg-blue-50'}`}
                                >
                                    <div className="relative">
                                        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-semibold overflow-hidden border border-gray-100
                                            ${display.type === 'self' ? 'bg-indigo-100 text-indigo-600' :
                                                display.type === 'group' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'}`}>
                                            {display.avatar ? (
                                                <img src={display.avatar.startsWith('http') ? display.avatar : `${API_BASE_URL}${display.avatar}`} alt={display.name} className="w-full h-full object-cover" />
                                            ) : (
                                                display.type === 'self' ? <CloudSync className="w-6 h-6" /> : display.name.charAt(0).toUpperCase()
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-1">
                                            <div className="flex items-center gap-1.5">
                                                {conv.isPinned && <Pin className="w-3 h-3 text-blue-500 flex-shrink-0" />}
                                                <h4 className={`font-semibold truncate ${isActive ? 'text-blue-700' : 'text-gray-800'}`}>
                                                    {display.name}
                                                </h4>
                                            </div>
                                            <span className="text-xs text-gray-400 whitespace-nowrap">
                                                {formatTime(conv.lastMessage?.createdAt || conv.createdAt)}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <p className={`text-sm truncate mr-4 ${conv.unreadCount > 0 ? 'text-gray-800 font-medium' : 'text-gray-500'}`}>
                                                {display.lastMessage}
                                            </p>
                                            {conv.unreadCount > 0 && (
                                                <div className="w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center flex-shrink-0">
                                                    {conv.unreadCount}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            {/* Resize Handle */}
            <div
                className="absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-gray-300 transition-colors opacity-0 hover:opacity-100 z-50"
                onMouseDown={() => {
                    isResizing.current = true;
                    document.body.style.cursor = 'col-resize';
                    document.body.style.userSelect = 'none';
                }}
            />

            {/* Context Menu */}
            {contextMenu && contextMenu.conversation && (
                <ContextMenu
                    x={contextMenu.x}
                    y={contextMenu.y}
                    onClose={() => setContextMenu(null)}
                    items={[
                        {
                            label: contextMenu.conversation.isPinned ? 'Bỏ ghim' : 'Ghim cuộc trò chuyện',
                            icon: <Pin className="w-4 h-4" />,
                            onClick: async () => {
                                if (!token || !contextMenu.conversation) return;
                                try {
                                    await conversationsApi.togglePin(token, contextMenu.conversation.id);
                                    togglePinConversation(contextMenu.conversation.id);
                                } catch (error) {
                                    console.error('Failed to toggle pin:', error);
                                }
                            }
                        },
                        {
                            label: 'Xóa tin nhắn',
                            icon: <Trash2 className="w-4 h-4" />,
                            danger: true,
                            divider: true,
                            onClick: () => {
                                if (!contextMenu.conversation) return;
                                const conv = contextMenu.conversation;
                                setConfirmModal({
                                    isOpen: true,
                                    title: 'Xóa tin nhắn',
                                    message: conv.type === 'self'
                                        ? 'Bạn có chắc muốn xóa tất cả tin nhắn trong Cloud? Hành động này không thể hoàn tác.'
                                        : 'Bạn có chắc muốn xóa tất cả tin nhắn trong cuộc trò chuyện này? Hành động này không thể hoàn tác.',
                                    action: 'clearMessages',
                                    conversationId: conv.id,
                                });
                            }
                        },
                        ...(contextMenu.conversation.type !== 'self' ? [{
                            label: 'Xóa cuộc trò chuyện',
                            icon: <Trash2 className="w-4 h-4" />,
                            danger: true,
                            onClick: () => {
                                if (!contextMenu.conversation) return;
                                setConfirmModal({
                                    isOpen: true,
                                    title: 'Xóa cuộc trò chuyện',
                                    message: 'Bạn có chắc muốn xóa cuộc trò chuyện này? Tất cả tin nhắn sẽ bị xóa và không thể hoàn tác.',
                                    action: 'deleteConversation',
                                    conversationId: contextMenu.conversation.id,
                                });
                            }
                        }] : [])
                    ]}
                />
            )}

            {/* Confirm Modal */}
            <ConfirmModal
                isOpen={confirmModal.isOpen}
                title={confirmModal.title}
                message={confirmModal.message}
                confirmText="Xóa"
                cancelText="Hủy"
                danger={true}
                onCancel={() => setConfirmModal({ ...confirmModal, isOpen: false })}
                onConfirm={async () => {
                    if (!token || !confirmModal.conversationId) return;

                    try {
                        if (confirmModal.action === 'clearMessages') {
                            await conversationsApi.clearMessages(token, confirmModal.conversationId);
                            clearConversationMessages(confirmModal.conversationId);
                        } else if (confirmModal.action === 'deleteConversation') {
                            await conversationsApi.delete(token, confirmModal.conversationId);
                            removeConversation(confirmModal.conversationId);
                        }
                    } catch (error) {
                        console.error('Failed to perform action:', error);
                    }

                    setConfirmModal({ ...confirmModal, isOpen: false });
                }}
            />
        </div>
    );
}

