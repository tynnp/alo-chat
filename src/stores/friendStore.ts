import { create } from 'zustand';

export interface Friend {
    id: string;
    username: string;
    displayName: string;
    avatarUrl?: string;
    status: 'online' | 'offline';
}

export interface FriendRequest {
    id: string;
    fromUserId: string;
    fromUserName: string;
    fromUserAvatar?: string;
    toUserId: string;
    toUserName: string;
    toUserAvatar?: string;
    status: 'pending' | 'accepted' | 'rejected';
    createdAt: Date;
}

export interface SentRequest {
    id: string;
    toUserId: string;
    toUserName: string;
    toUserAvatar?: string;
    status: 'pending';
    createdAt: Date;
}

interface FriendState {
    friends: Friend[];
    friendRequests: FriendRequest[];
    sentRequests: SentRequest[];
    isLoading: boolean;
    error: string | null;

    setFriends: (friends: Friend[]) => void;
    addFriend: (friend: Friend) => void;
    removeFriend: (friendId: string) => void;

    setFriendRequests: (requests: FriendRequest[]) => void;
    addFriendRequest: (request: FriendRequest) => void;
    removeFriendRequest: (requestId: string) => void;

    setSentRequests: (requests: SentRequest[]) => void;
    addSentRequest: (request: SentRequest) => void;
    removeSentRequest: (requestId: string) => void;

    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
    reset: () => void;
}

export const useFriendStore = create<FriendState>((set) => ({
    friends: [],
    friendRequests: [],
    sentRequests: [],
    isLoading: false,
    error: null,

    setFriends: (friends) => set({ friends }),

    addFriend: (friend) => set((state) => ({
        friends: [...state.friends, friend]
    })),

    removeFriend: (friendId) => set((state) => ({
        friends: state.friends.filter(f => f.id !== friendId)
    })),

    setFriendRequests: (requests) => set({ friendRequests: requests }),

    addFriendRequest: (request) => set((state) => ({
        friendRequests: [request, ...state.friendRequests]
    })),

    removeFriendRequest: (requestId) => set((state) => ({
        friendRequests: state.friendRequests.filter(r => r.id !== requestId)
    })),

    setSentRequests: (requests) => set({ sentRequests: requests }),

    addSentRequest: (request) => set((state) => ({
        sentRequests: [request, ...state.sentRequests]
    })),

    removeSentRequest: (requestId) => set((state) => ({
        sentRequests: state.sentRequests.filter(r => r.id !== requestId)
    })),

    setLoading: (loading) => set({ isLoading: loading }),
    setError: (error) => set({ error }),
    reset: () => set({
        friends: [],
        friendRequests: [],
        sentRequests: [],
        isLoading: false,
        error: null
    }),
}));