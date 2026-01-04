import { useChatStore } from '../../stores/chatStore';

interface TypingIndicatorProps {
    conversationId: string | null;
}

export default function TypingIndicator({ conversationId }: TypingIndicatorProps) {
    const typingUser = useChatStore(state =>
        conversationId ? state.typingUsers[conversationId] : null
    );

    if (!typingUser) return null;

    return (
        <div className="px-4 py-2 bg-white border-t border-gray-100">
            <div className="flex items-center gap-2 text-sm text-gray-500">
                <div className="flex gap-1">
                    <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
                <span className="italic">{typingUser.userName} đang soạn tin nhắn...</span>
            </div>
        </div>
    );
}
