import WebSocket from '@tauri-apps/plugin-websocket';
import { useSocketStore } from '../stores/socketStore';
import { useChatStore, type Message } from '../stores/chatStore';

const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8000/ws';

let ws: Awaited<ReturnType<typeof WebSocket.connect>> | null = null;

export const socketService = {
    connect: async (token: string) => {
        const socketStore = useSocketStore.getState();

        if (ws) {
            await ws.disconnect();
        }

        socketStore.setConnecting(true);

        try {
            ws = await WebSocket.connect(`${WS_URL}?token=${token}`);

            ws.addListener((msg) => {
                if (msg.type === 'Text') {
                    const data = JSON.parse(msg.data as string);
                    handleMessage(data);
                }
            });

            socketStore.setConnected(true);
        } catch (error) {
            socketStore.setError((error as Error).message);
        }
    },

    disconnect: async () => {
        if (ws) {
            await ws.disconnect();
            ws = null;
        }
        useSocketStore.getState().setConnected(false);
    },

    send: async (event: string, data: unknown) => {
        if (ws) {
            await ws.send(JSON.stringify({ event, data }));
        }
    },

    sendMessage: async (conversationId: string, content: string, type: 'text' | 'file' = 'text') => {
        await socketService.send('message:send', { conversationId, content, type });
    },

    sendTyping: async (conversationId: string) => {
        await socketService.send('user:typing', { conversationId });
    },

    markAsRead: async (conversationId: string, messageId: string) => {
        await socketService.send('message:read', { conversationId, messageId });
    },
};

function handleMessage(data: { event: string; payload: unknown }) {
    const chatStore = useChatStore.getState();

    switch (data.event) {
        case 'message:new': {
            const message = data.payload as Message;
            chatStore.addMessage(message.conversationId, message);
            break;
        }
        case 'message:status': {
            const { conversationId, messageId, status } = data.payload as {
                conversationId: string;
                messageId: string;
                status: Message['status'];
            };
            chatStore.updateMessageStatus(conversationId, messageId, status);
            break;
        }
    }
}
