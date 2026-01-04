import { useState, useEffect } from 'react';
import { getCurrentWindow } from '@tauri-apps/api/window';
import { X, Minus, Square, Copy } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';

const appWindow = getCurrentWindow();

export default function TitleBar() {
    const [isMaximized, setIsMaximized] = useState(false);
    const { user } = useAuthStore();

    useEffect(() => {
        const updateMaximized = async () => {
            const maximized = await appWindow.isMaximized();
            setIsMaximized(maximized);
        };

        updateMaximized();

        const unlisten = appWindow.onResized(() => {
            updateMaximized();
        });

        return () => {
            unlisten.then(f => f());
        };
    }, []);

    const handleMinimize = () => appWindow.minimize();
    const handleMaximize = async () => {
        await appWindow.toggleMaximize();
        const maximized = await appWindow.isMaximized();
        setIsMaximized(maximized);
    };
    const handleClose = () => appWindow.close();

    const handleDragStart = (e: React.MouseEvent) => {
        if ((e.target as HTMLElement).closest('button')) return;
        appWindow.startDragging();
    };

    return (
        <div
            onMouseDown={handleDragStart}
            className="h-8 bg-white border-b border-gray-200 flex items-center justify-between pl-4 select-none fixed top-0 left-0 right-0 z-[9999]"
        >
            <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-blue-950">
                    ALO {user ? `- ${user.displayName}` : ''}
                </span>
            </div>

            <div className="flex items-center h-full">
                <button
                    onClick={handleMinimize}
                    tabIndex={-1}
                    className="h-full px-4 flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors"
                    title="Thu nhỏ"
                >
                    <Minus className="w-4 h-4" />
                </button>
                <button
                    onClick={handleMaximize}
                    tabIndex={-1}
                    className="h-full px-4 flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors"
                    title={isMaximized ? "Thu nhỏ" : "Phóng to"}
                >
                    {isMaximized ? <Copy className="w-3.5 h-3.5" /> : <Square className="w-3.5 h-3.5" />}
                </button>
                <button
                    onClick={handleClose}
                    tabIndex={-1}
                    className="h-full px-4 flex items-center justify-center text-gray-400 hover:bg-red-500 hover:text-white transition-colors"
                    title="Đóng"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}
