import { useRef, useEffect } from 'react';
import { Check, CheckCheck } from 'lucide-react';
import { API_BASE_URL } from '../../services/api';

interface Message {
    id: string;
    content: string;
    senderId: string;
    senderAvatar?: string;
    senderName?: string;
    timestamp: string;
    type: 'text' | 'image' | 'file';
    status?: 'sending' | 'sent' | 'received' | 'read';
}

interface MessageListProps {
    messages: Message[];
    currentUserId: string;
}

export default function MessageList({ messages, currentUserId }: MessageListProps) {
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    if (messages.length === 0) {
        return (
            <div className="flex-1 flex items-center justify-center bg-gray-50">
                <p className="text-gray-400 text-sm">Chưa có tin nhắn. Hãy bắt đầu cuộc trò chuyện!</p>
            </div>
        );
    }

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
                            <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
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
        </div>
    );
}