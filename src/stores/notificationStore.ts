import { create } from 'zustand';
import { WebviewWindow } from '@tauri-apps/api/webviewWindow';
import { currentMonitor, LogicalPosition } from '@tauri-apps/api/window';

export interface Notification {
    id: string;
    senderName: string;
    senderAvatar?: string;
    content: string;
    conversationId: string;
    timestamp: Date;
}

interface NotificationState {
    notifications: Notification[];
    addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => void;
    removeNotification: (id: string) => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
    notifications: [],
    addNotification: async (notification) => {
        const id = Math.random().toString(36).substring(7);
        const newNotification: Notification = {
            ...notification,
            id,
            timestamp: new Date(),
        };

        set((state) => ({
            notifications: [newNotification, ...state.notifications].slice(0, 5),
        }));

        try {
            try {
                const allWindows = await WebviewWindow.getAll();
                for (const win of allWindows) {
                    if (win.label.startsWith('notification-')) {
                        await win.close();
                    }
                }
            } catch (err) { }

            const label = `notification-${id}`;

            const queryParams = new URLSearchParams({
                name: notification.senderName,
                avatar: notification.senderAvatar || '',
                content: notification.content,
                convId: notification.conversationId
            }).toString();

            const winWidth = 380;
            const winHeight = 120;

            const webview = new WebviewWindow(label, {
                url: `/notification-pop?${queryParams}`,
                title: 'ALO Chat Notification',
                width: winWidth,
                height: winHeight,
                resizable: false,
                alwaysOnTop: true,
                decorations: false,
                transparent: true,
                hiddenTitle: true,
                skipTaskbar: true,
                visible: false,
                shadow: false,
                backgroundColor: [0, 0, 0, 0]
            });

            webview.once('tauri://created', async function () {
                setTimeout(async () => {
                    try {
                        const monitor = await currentMonitor();
                        if (monitor) {
                            const { width, height } = monitor.size;
                            const scaleFactor = monitor.scaleFactor;
                            const x = (width / scaleFactor) - winWidth - 20;
                            const y = (height / scaleFactor) - winHeight - 80;
                            await webview.setPosition(new LogicalPosition(x, y));
                        }
                        await webview.setAlwaysOnTop(true);
                        await webview.show();
                        await webview.setFocus();
                    } catch (err) {
                        try { await webview.show(); } catch (e) { }
                    }
                }, 250);
            });

            webview.once('tauri://error', function () {
            });

            setTimeout(async () => {
                try {
                    const win = await WebviewWindow.getByLabel(label);
                    if (win) {
                        await win.close();
                    }
                } catch (err) { }
            }, 5500);

        } catch (e) {
        }

        setTimeout(() => {
            set((state) => ({
                notifications: state.notifications.filter((n) => n.id !== id),
            }));
        }, 5000);
    },
    removeNotification: (id) =>
        set((state) => ({
            notifications: state.notifications.filter((n) => n.id !== id),
        })),
}));