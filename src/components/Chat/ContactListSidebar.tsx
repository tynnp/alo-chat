import { useRef, useEffect, useState } from 'react';
import { Search, UserPlus, X, Loader2 } from 'lucide-react';
import { useFriendStore } from '../../stores/friendStore';
import { useAuthStore } from '../../stores/authStore';
import { friendsApi, usersApi, type UserResponse, API_BASE_URL } from '../../services/api';

interface ContactListSidebarProps {
    onSelectContact: (id: string) => void;
    width: number;
    setWidth: (width: number) => void;
}

export default function ContactListSidebar({ onSelectContact, width, setWidth }: ContactListSidebarProps) {
    const isResizing = useRef(false);
    const { friends, friendRequests, sentRequests, removeFriendRequest, addFriend, addSentRequest } = useFriendStore();
    const { token, user } = useAuthStore();

    const filteredFriends = friends.filter(f => f.id !== user?.id);

    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<UserResponse[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    // Xử lý thay đổi kích thước
    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!isResizing.current) return;

            const newWidth = Math.max(260, Math.min(450, e.clientX - 64));
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

    useEffect(() => {
        if (!searchQuery.trim() || !token) {
            setSearchResults([]);
            return;
        }

        const timer = setTimeout(async () => {
            setIsSearching(true);
            try {
                const response = await usersApi.search(token, searchQuery);
                const friendIds = friends.map(f => f.id);
                const sentIds = sentRequests.map(r => r.toUserId);
                const requestIds = friendRequests.map(r => r.fromUserId);

                const filtered = response.users.filter(u =>
                    !friendIds.includes(u.id) &&
                    !sentIds.includes(u.id) &&
                    !requestIds.includes(u.id)
                );
                setSearchResults(filtered);
            } catch (error) {
                console.error('Search failed:', error);
            } finally {
                setIsSearching(false);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [searchQuery, token, friends, sentRequests, friendRequests]);

    const handleSendRequest = async (userId: string, userName: string) => {
        if (!token) return;
        setActionLoading(userId);

        try {
            const response = await friendsApi.sendRequest(token, userId);
            addSentRequest({
                id: response.request_id,
                toUserId: userId,
                toUserName: userName,
                status: 'pending',
                createdAt: new Date(),
            });

            setSearchResults(prev => prev.filter(u => u.id !== userId));
        } catch (error) {
            alert((error as Error).message);
        } finally {
            setActionLoading(null);
        }
    };

    const handleAcceptRequest = async (requestId: string, fromUserId: string, fromUserName: string) => {
        if (!token) return;
        setActionLoading(requestId);

        try {
            await friendsApi.acceptRequest(token, requestId);
            removeFriendRequest(requestId);

            // Thêm vào danh sách bạn bè
            addFriend({
                id: fromUserId,
                username: '',
                displayName: fromUserName,
                status: 'offline',
            });
        } catch (error) {
            alert((error as Error).message);
        } finally {
            setActionLoading(null);
        }
    };

    const handleRejectRequest = async (requestId: string) => {
        if (!token) return;
        setActionLoading(requestId);

        try {
            await friendsApi.rejectRequest(token, requestId);
            removeFriendRequest(requestId);
        } catch (error) {
            alert((error as Error).message);
        } finally {
            setActionLoading(null);
        }
    };

    return (
        <div
            className="h-full bg-white border-r border-gray-200 flex flex-col relative flex-shrink-0"
            style={{ width: `${width}px` }}
        >
            {/* Header */}
            <div className="h-16 px-4 border-b border-gray-200 flex items-center justify-between flex-shrink-0">
                <h2 className="text-xl font-bold text-gray-800">Danh bạ</h2>
            </div>

            {/* Search */}
            <div className="p-4 pt-2 pb-2">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Tìm người dùng để kết bạn..."
                        className="w-full pl-9 pr-8 py-2 bg-gray-100 border-none rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                    />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery('')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
                {/* Search Results */}
                {searchQuery && (
                    <div className="mb-2">
                        <div className="px-4 py-2 text-xs font-semibold text-blue-600 uppercase tracking-wider bg-blue-50">
                            Kết quả tìm kiếm
                        </div>
                        {isSearching ? (
                            <div className="p-4 text-center">
                                <Loader2 className="w-5 h-5 animate-spin mx-auto text-blue-500" />
                            </div>
                        ) : searchResults.length === 0 ? (
                            <div className="p-4 text-center text-gray-400 text-sm">
                                Không tìm thấy người dùng
                            </div>
                        ) : (
                            <div className="p-2 space-y-2">
                                {searchResults.map(user => (
                                    <div key={user.id} className="p-3 bg-white border border-gray-100 rounded-xl flex items-center justify-between shadow-sm">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-semibold overflow-hidden border border-gray-100">
                                                {user.avatar_url ? (
                                                    <img src={user.avatar_url.startsWith('http') ? user.avatar_url : `${API_BASE_URL}${user.avatar_url}`} alt={user.display_name} className="w-full h-full object-cover" />
                                                ) : (
                                                    user.display_name.charAt(0)
                                                )}
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-gray-800 text-sm">{user.display_name}</h4>
                                                <p className="text-xs text-gray-500">@{user.username}</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleSendRequest(user.id, user.display_name)}
                                            disabled={actionLoading === user.id}
                                            className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
                                        >
                                            {actionLoading === user.id ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : (
                                                <UserPlus className="w-4 h-4" />
                                            )}
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

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
                                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-semibold overflow-hidden border border-gray-100">
                                            {req.fromUserAvatar ? (
                                                <img src={req.fromUserAvatar.startsWith('http') ? req.fromUserAvatar : `${API_BASE_URL}${req.fromUserAvatar}`} alt={req.fromUserName} className="w-full h-full object-cover" />
                                            ) : (
                                                req.fromUserName.charAt(0)
                                            )}
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-gray-800 text-sm">{req.fromUserName}</h4>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleAcceptRequest(req.id, req.fromUserId, req.fromUserName)}
                                            disabled={actionLoading === req.id}
                                            className="flex-1 py-1.5 bg-blue-500 text-white text-xs font-medium rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
                                        >
                                            {actionLoading === req.id ? 'Đang xử lý...' : 'Đồng ý'}
                                        </button>
                                        <button
                                            onClick={() => handleRejectRequest(req.id)}
                                            disabled={actionLoading === req.id}
                                            className="flex-1 py-1.5 bg-gray-100 text-gray-600 text-xs font-medium rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
                                        >
                                            Từ chối
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Sent Requests */}
                {sentRequests.length > 0 && (
                    <div className="mb-2">
                        <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50">
                            Đã gửi lời mời ({sentRequests.length})
                        </div>
                        <div className="p-2">
                            {sentRequests.map(req => (
                                <div key={req.id} className="p-3 flex items-center gap-3 text-gray-500">
                                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 font-semibold overflow-hidden border border-gray-100">
                                        {req.toUserAvatar ? (
                                            <img src={req.toUserAvatar.startsWith('http') ? req.toUserAvatar : `${API_BASE_URL}${req.toUserAvatar}`} alt={req.toUserName} className="w-full h-full object-cover" />
                                        ) : (
                                            req.toUserName.charAt(0)
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-medium text-gray-600 text-sm">{req.toUserName}</h4>
                                        <p className="text-xs text-gray-400">Đang chờ phản hồi...</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Friends List */}
                <div className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Bạn bè ({filteredFriends.length})
                </div>

                {filteredFriends.length === 0 ? (
                    <div className="text-center py-8 text-gray-400">
                        <p className="text-sm">Chưa có bạn bè nào</p>
                        <p className="text-xs mt-1">Tìm kiếm và kết bạn ngay!</p>
                    </div>
                ) : (
                    <div className="space-y-1 px-2">
                        {filteredFriends.map(friend => (
                            <div
                                key={friend.id}
                                onClick={() => onSelectContact(friend.id)}
                                className="group p-3 flex items-center gap-3 rounded-xl hover:bg-blue-50 cursor-pointer transition-colors"
                            >
                                <div className="relative">
                                    <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center font-semibold overflow-hidden border border-gray-100">
                                        {friend.avatarUrl ? (
                                            <img src={friend.avatarUrl.startsWith('http') ? friend.avatarUrl : `${API_BASE_URL}${friend.avatarUrl}`} alt={friend.displayName} className="w-full h-full object-cover" />
                                        ) : (
                                            friend.displayName.charAt(0).toUpperCase()
                                        )}
                                    </div>
                                    <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white
                                        ${friend.status === 'online' ? 'bg-green-500' : 'bg-gray-400'}`}>
                                    </div>
                                </div>

                                <div className="flex-1 min-w-0">
                                    <h4 className="font-semibold text-gray-800 truncate">{friend.displayName}</h4>
                                    <p className="text-xs text-gray-500">
                                        {friend.status === 'online' ? 'Đang hoạt động' : 'Offline'}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
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
        </div>
    );
}