import { Paperclip, Smile, Send, X, Loader2 } from 'lucide-react';
import { useState, useRef } from 'react';

interface ChatInputProps {
    onSendMessage: (content: string, type?: 'text' | 'file' | 'image', fileUrl?: string, fileName?: string) => void;
    onFileUpload: (file: File) => Promise<{ file_url: string; file_name: string; file_type: 'image' | 'file' } | null>;
}

export default function ChatInput({ onSendMessage, onFileUpload }: ChatInputProps) {
    const [message, setMessage] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const [selectedFile, setSelectedFile] = useState<{ file: File; preview?: string } | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleSend = async () => {
        if (selectedFile) {
            setIsUploading(true);
            try {
                const result = await onFileUpload(selectedFile.file);
                if (result) {
                    onSendMessage(result.file_name, result.file_type, result.file_url, result.file_name);
                }
            } catch (error) {
                console.error('Upload failed:', error);
            } finally {
                setIsUploading(false);
                setSelectedFile(null);
            }
            return;
        }

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

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const isImage = file.type.startsWith('image/');
            setSelectedFile({
                file,
                preview: isImage ? URL.createObjectURL(file) : undefined,
            });
        }
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const clearSelectedFile = () => {
        if (selectedFile?.preview) {
            URL.revokeObjectURL(selectedFile.preview);
        }
        setSelectedFile(null);
    };

    return (
        <div className="bg-white border-t border-gray-200 px-4 py-3">
            {/* File Preview */}
            {selectedFile && (
                <div className="mb-2 p-2 bg-gray-50 rounded-lg flex items-center gap-3">
                    {selectedFile.preview ? (
                        <img src={selectedFile.preview} alt="Preview" className="w-16 h-16 object-cover rounded-lg" />
                    ) : (
                        <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Paperclip className="w-6 h-6 text-blue-500" />
                        </div>
                    )}
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">{selectedFile.file.name}</p>
                        <p className="text-xs text-gray-500">{(selectedFile.file.size / 1024).toFixed(1)} KB</p>
                    </div>
                    <button
                        onClick={clearSelectedFile}
                        className="p-1.5 hover:bg-gray-200 rounded-full transition-colors"
                    >
                        <X className="w-4 h-4 text-gray-500" />
                    </button>
                </div>
            )}

            <div className="flex items-center gap-2">
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    className="hidden"
                    accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.zip,.rar"
                />
                <button
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2 text-gray-400 hover:text-blue-500 hover:bg-gray-100 rounded-full transition-all"
                >
                    <Paperclip className="w-5 h-5" />
                </button>

                <div className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 focus-within:ring-2 focus-within:ring-blue-500/50 focus-within:border-blue-500 transition-all flex items-center gap-2">
                    <input
                        type="text"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={selectedFile ? "Nhấn gửi để tải file..." : "Nhập tin nhắn..."}
                        disabled={!!selectedFile}
                        className="flex-1 bg-transparent border-none focus:outline-none text-gray-800 text-sm py-1 max-h-32 overflow-y-auto disabled:text-gray-400"
                    />
                    <button className="text-gray-400 hover:text-yellow-500 transition-colors">
                        <Smile className="w-5 h-5" />
                    </button>
                </div>

                <button
                    onClick={handleSend}
                    disabled={(!message.trim() && !selectedFile) || isUploading}
                    className="p-2 text-blue-500 hover:bg-blue-50 rounded-full transition-all flex-shrink-0 disabled:text-gray-300 disabled:cursor-not-allowed"
                >
                    {isUploading ? (
                        <Loader2 className="w-6 h-6 animate-spin" />
                    ) : (
                        <Send className="w-6 h-6" />
                    )}
                </button>
            </div>
        </div>
    );
}