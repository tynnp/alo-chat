import { Paperclip, Smile, Send } from 'lucide-react';
import { useState } from 'react';

interface ChatInputProps {
    onSendMessage: (content: string) => void;
}

export default function ChatInput({ onSendMessage }: ChatInputProps) {
    const [message, setMessage] = useState('');

    const handleSend = () => {
        if (message.trim()) {
            onSendMessage(message);
            setMessage('');
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="bg-white border-t border-gray-200 px-4 py-3">
            <div className="flex items-center gap-2">
                <button className="p-2 text-gray-400 hover:text-blue-500 hover:bg-gray-100 rounded-full transition-all">
                    <Paperclip className="w-5 h-5" />
                </button>

                <div className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 focus-within:ring-2 focus-within:ring-blue-500/50 focus-within:border-blue-500 transition-all flex items-center gap-2">
                    <input
                        type="text"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Nhập tin nhắn..."
                        className="flex-1 bg-transparent border-none focus:outline-none text-gray-800 text-sm py-1 max-h-32 overflow-y-auto"
                    />
                    <button className="text-gray-400 hover:text-yellow-500 transition-colors">
                        <Smile className="w-5 h-5" />
                    </button>
                </div>

                <button
                    onClick={handleSend}
                    disabled={!message.trim()}
                    className="p-2 text-blue-500 hover:bg-blue-50 rounded-full transition-all flex-shrink-0 disabled:text-gray-300 disabled:cursor-not-allowed"
                >
                    <Send className="w-6 h-6" />
                </button>
            </div>
        </div>
    );
}