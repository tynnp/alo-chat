import { useRef, useEffect, useState } from 'react';
import { Check, CheckCheck, FileIcon, Download, BriefcaseBusiness, CloudSync } from 'lucide-react';
import { API_BASE_URL } from '../../services/api';
import { save } from '@tauri-apps/plugin-dialog';
import { writeFile } from '@tauri-apps/plugin-fs';
import ImageViewer from './ImageViewer';

interface Message {
    id: string;
    content: string;
    senderId: string;
    senderAvatar?: string;
    senderName?: string;
    timestamp: string;
    type: 'text' | 'image' | 'file';
    fileUrl?: string;
    fileName?: string;
    status?: 'sending' | 'sent' | 'received' | 'read';
}

interface MessageListProps {
    messages: Message[];
    currentUserId: string;
    conversationType?: 'private' | 'group' | 'self';
}

export default function MessageList({
    messages,
    currentUserId,
    conversationType
}: MessageListProps) {
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [viewingImage, setViewingImage] = useState<{ url: string; fileName: string } | null>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    if (messages.length === 0) {
        if (conversationType === 'self') {
            return (
                <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 p-8">
                    <CloudSync className="w-12 h-12 text-gray-300 mb-3" />
                    <p className="text-gray-400 text-sm">Chưa có tin nhắn</p>
                </div>
            );
        }

        return (
            <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 p-8">
                <div className="text-center max-w-md">
                    <BriefcaseBusiness className="w-12 h-12 text-blue-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">
                        Chào mừng 2 bạn đã kết nối với nhau!
                    </h3>
                    <p className="text-gray-500 text-sm">
                        Hãy bắt đầu trao đổi công việc nhé!
                    </p>
                </div>
            </div>
        );
    }

    const getFileUrl = (url?: string) => {
        if (!url) return '';
        return url.startsWith('http') ? url : `${API_BASE_URL}${url}`;
    };

    const handleDownloadFile = async (url: string, fileName: string) => {
        try {
            const filePath = await save({
                defaultPath: fileName,
                filters: [{ name: 'All Files', extensions: ['*'] }]
            });

            if (!filePath) return;

            const response = await fetch(url);
            if (!response.ok) throw new Error('Download failed');

            const arrayBuffer = await response.arrayBuffer();
            const uint8Array = new Uint8Array(arrayBuffer);

            await writeFile(filePath, uint8Array);

            alert('Tải file thành công!');
        } catch (error) {
            console.error('Failed to download file:', error);
            alert('Không thể tải file. Vui lòng thử lại.');
        }
    };

    const handleOpenImage = (url: string, fileName: string) => {
        setViewingImage({ url, fileName });
    };

    const renderMessageContent = (msg: Message, isOwn: boolean) => {
        if (msg.type === 'image' && msg.fileUrl) {
            const url = getFileUrl(msg.fileUrl);
            const fileName = msg.fileName || 'image.jpg';
            return (
                <div onClick={() => handleOpenImage(url, fileName)} className="cursor-pointer">
                    <img
                        src={url}
                        alt={msg.fileName || 'Image'}
                        className="max-w-full max-h-64 rounded-lg hover:opacity-90 transition-opacity"
                    />
                </div>
            );
        }

        if (msg.type === 'file' && msg.fileUrl) {
            const url = getFileUrl(msg.fileUrl);
            const fileName = msg.fileName || 'file';
            return (
                <div
                    onClick={() => handleDownloadFile(url, fileName)}
                    className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer ${isOwn ? 'bg-blue-400/30' : 'bg-gray-100'} hover:opacity-80 transition-opacity`}
                >
                    <div className={`p-2 rounded-lg ${isOwn ? 'bg-blue-400/50' : 'bg-blue-100'}`}>
                        <FileIcon className={`w-5 h-5 ${isOwn ? 'text-white' : 'text-blue-500'}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium truncate ${isOwn ? 'text-white' : 'text-gray-800'}`}>
                            {msg.fileName || 'File'}
                        </p>
                        <p className={`text-xs ${isOwn ? 'text-blue-100' : 'text-gray-500'}`}>
                            Nhấn để tải xuống
                        </p>
                    </div>
                    <Download className={`w-4 h-4 ${isOwn ? 'text-white' : 'text-gray-400'}`} />
                </div>
            );
        }

        return <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>;
    };

    return (
        <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-gray-50 custom-scrollbar">
            {messages.map((msg) => {
                const isOwn = msg.senderId === currentUserId;

                // Helper render avatar
                const Avatar = () => (
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 overflow-hidden border border-gray-100
                        ${isOwn ? 'bg-indigo-100 text-indigo-600' : 'bg-blue-100 text-blue-600'}`}>
                        {msg.senderAvatar ? (
                            <img src={msg.senderAvatar.startsWith('http') ? msg.senderAvatar : `${API_BASE_URL}${msg.senderAvatar}`} alt={msg.senderName} className="w-full h-full object-cover" />
                        ) : (
                            <span>{(msg.senderName || (isOwn ? 'T' : 'N')).charAt(0).toUpperCase()}</span>
                        )}
                    </div>
                );

                return (
                    <div key={msg.id} className={`flex items-end gap-2 ${isOwn ? 'justify-end' : 'justify-start'}`}>
                        {!isOwn && <Avatar />}

                        <div className={`max-w-[70%] rounded-2xl px-4 py-2 shadow-sm relative group ${isOwn
                            ? 'bg-blue-500 text-white rounded-br-none'
                            : 'bg-white text-gray-800 border border-gray-100 rounded-bl-none'
                            }`}>
                            {renderMessageContent(msg, isOwn)}
                            <span className={`text-[10px] absolute -bottom-5 ${isOwn ? 'right-0' : 'left-0'} text-gray-400 font-medium opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap flex items-center gap-1`}>
                                {msg.timestamp}
                                {isOwn && msg.status && (
                                    <span>
                                        {msg.status === 'sending' && <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                                        {msg.status === 'sent' && <Check className="w-3 h-3" />}
                                        {msg.status === 'received' && <CheckCheck className="w-3 h-3" />}
                                        {msg.status === 'read' && <CheckCheck className="w-3 h-3 text-blue-300" />}
                                    </span>
                                )}
                            </span>
                        </div>

                        {isOwn && <Avatar />}
                    </div>
                );
            })}
            <div ref={messagesEndRef} />

            {/* Image Viewer Modal */}
            {viewingImage && (
                <ImageViewer
                    imageUrl={viewingImage.url}
                    fileName={viewingImage.fileName}
                    onClose={() => setViewingImage(null)}
                />
            )}
        </div>
    );
}