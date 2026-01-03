import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { X } from 'lucide-react';
import { API_BASE_URL } from '../services/api';
import { WebviewWindow, getCurrentWebviewWindow } from '@tauri-apps/api/webviewWindow';
import { emit } from '@tauri-apps/api/event';

export default function NotificationPopup() {
    const [searchParams] = useSearchParams();
    const senderName = searchParams.get('name') || 'Người dùng';
    const senderAvatar = searchParams.get('avatar');
    const content = searchParams.get('content') || '';
    const conversationId = searchParams.get('convId');

    const handleClose = async () => {
        try {
            const appWindow = getCurrentWebviewWindow();
            await appWindow.close();
        } catch (err) {
        }
    };

    const handleClick = async () => {
        try {
            await emit('open-conversation', { conversationId });

            const mainWindow = await WebviewWindow.getByLabel('main');
            if (mainWindow) {
                await mainWindow.unminimize();
                await mainWindow.maximize();
                await mainWindow.show();
                await mainWindow.setFocus();
            }

            setTimeout(handleClose, 250);
        } catch (err) {
            await handleClose();
        }
    };

    useEffect(() => {
        const style = document.createElement('style');
        style.innerHTML = `
            html, body, #root { 
                background: transparent !important; 
                background-color: transparent !important;
                background-image: none !important;
                overflow: hidden !important;
                margin: 0;
                padding: 0;
            }
        `;
        document.head.appendChild(style);

        const timer = setTimeout(handleClose, 4500);
        return () => {
            clearTimeout(timer);
        };
    }, []);

    return (
        <div className="h-screen w-screen overflow-hidden bg-transparent select-none pointer-events-none flex items-stretch">
            <div
                onClick={handleClick}
                className="w-full h-full bg-white shadow-2xl flex gap-4 cursor-pointer hover:bg-gray-50 transition-all border-l-[6px] border-l-blue-500 pointer-events-auto p-4 relative"
            >
                <div className="relative flex-shrink-0 flex items-center">
                    {senderAvatar ? (
                        <img
                            src={senderAvatar.startsWith('http') ? senderAvatar : `${API_BASE_URL}${senderAvatar}`}
                            alt={senderName}
                            className="w-14 h-14 rounded-full object-cover border-2 border-gray-100 shadow-sm"
                        />
                    ) : (
                        <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold border-2 border-blue-200 shadow-sm text-xl">
                            {senderName.charAt(0).toUpperCase()}
                        </div>
                    )}
                </div>

                <div className="flex-1 min-w-0 flex flex-col justify-center">
                    <div className="flex items-start justify-between gap-2">
                        <h4 className="font-bold text-gray-900 truncate text-lg leading-tight">{senderName}</h4>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                handleClose();
                            }}
                            className="p-1.5 rounded-full hover:bg-gray-200 text-gray-400 hover:text-gray-600 transition-colors pointer-events-auto mt-[-4px] mr-[-4px]"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2 mt-1.5 leading-relaxed pr-2">
                        {content}
                    </p>
                    <div className="absolute right-4 bottom-2 text-[11px] text-blue-500 font-semibold opacity-70">
                        Bấm để trả lời
                    </div>
                </div>
            </div>
        </div>
    );
}