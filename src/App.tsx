import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './stores/authStore';
import { useChatStore } from './stores/chatStore';
import { useFriendStore } from './stores/friendStore';
import { conversationsApi, friendsApi, type ConversationResponse } from './services/api';
import { socketService } from './services/socket';
import Login from './pages/Login';
import Register from './pages/Register';
import Chat from './pages/Chat';
import NotificationPopup from './pages/NotificationPopup';
import './App.css';

// Component để khởi tạo app khi đã đăng nhập
function AppInitializer({ children }: { children: React.ReactNode }) {
  const { token, isAuthenticated, logout } = useAuthStore();
  const { setConversations } = useChatStore();
  const { setFriends, setFriendRequests, setSentRequests } = useFriendStore();

  useEffect(() => {
    if (!isAuthenticated || !token) return;

    const initializeApp = async () => {
      try {
        // Kết nối WebSocket
        await socketService.connect(token);

        // Tải danh sách hội thoại
        const convResponse = await conversationsApi.getAll(token);
        const conversations = convResponse.conversations.map((conv: ConversationResponse & { last_message?: { _id: string; content: string; sender_id: string; type: string; created_at: string } }) => ({
          id: conv._id,
          type: conv.type,
          name: conv.name,
          members: conv.members.map(m => m.user_id),
          unreadCount: conv.unread_count,
          createdAt: new Date(conv.created_at),
          lastMessage: conv.last_message ? {
            id: conv.last_message._id,
            conversationId: conv._id,
            senderId: conv.last_message.sender_id,
            content: conv.last_message.content,
            type: conv.last_message.type as 'text' | 'file' | 'image' | 'system',
            status: 'sent' as const,
            createdAt: new Date(conv.last_message.created_at),
          } : undefined,
        }));
        setConversations(conversations);

        // Tải danh sách bạn bè
        const friendsResponse = await friendsApi.getAll(token);
        const friends = friendsResponse.friends.map((f: any) => ({
          id: f.id,
          username: f.username,
          displayName: f.display_name,
          avatarUrl: f.avatar_url,
          status: f.status,
          lastOnline: f.last_online ? new Date(f.last_online) : undefined,
        }));
        setFriends(friends);

        // Tải các lời mời kết bạn
        const requestsResponse = await friendsApi.getRequests(token);
        const requests = requestsResponse.requests.map(r => ({
          id: r.id,
          fromUserId: r.from_user_id,
          fromUserName: r.from_user_name,
          fromUserAvatar: r.from_user_avatar,
          toUserId: r.to_user_id,
          toUserName: r.to_user_name,
          toUserAvatar: r.to_user_avatar,
          status: r.status as 'pending' | 'accepted' | 'rejected',
          createdAt: new Date(r.created_at),
        }));
        setFriendRequests(requests);

        // Tải các yêu cầu đã gửi
        const sentResponse = await friendsApi.getSentRequests(token);
        const sentRequests = sentResponse.sent_requests.map(r => ({
          id: r.id,
          toUserId: r.to_user_id,
          toUserName: r.to_user_name,
          toUserAvatar: r.to_user_avatar,
          status: r.status as 'pending',
          createdAt: new Date(r.created_at),
        }));
        setSentRequests(sentRequests);

      } catch (error) {
        console.error('Failed to initialize app:', error);
        // Nếu token không hợp lệ, logout
        if ((error as Error).message.includes('401') || (error as Error).message.includes('Unauthorized')) {
          logout();
        }
      }
    };

    initializeApp();

    // Cleanup: disconnect socket khi unmount hoặc logout
    return () => {
      socketService.disconnect();
    };
  }, [isAuthenticated, token]);

  return <>{children}</>;
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/chat"
          element={
            <ProtectedRoute>
              <AppInitializer>
                <Chat />
              </AppInitializer>
            </ProtectedRoute>
          }
        />
        <Route path="/notification-pop" element={<NotificationPopup />} />
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;