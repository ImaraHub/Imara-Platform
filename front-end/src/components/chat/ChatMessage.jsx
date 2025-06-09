import React from 'react';

function ChatMessage({ message, isCurrentUser }) {
    const formatTime = (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div
            className={`flex ${
                isCurrentUser ? 'justify-end' : 'justify-start'
            }`}
        >
            <div
                className={`max-w-[70%] rounded-lg px-4 py-2 ${
                    isCurrentUser
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-700 text-white'
                }`}
            >
                {!isCurrentUser && (
                    <div className="text-sm font-semibold mb-1">
                        {message.username}
                    </div>
                )}
                <div className="break-words">{message.content}</div>
                <div
                    className={`text-xs mt-1 ${
                        isCurrentUser ? 'text-blue-200' : 'text-gray-400'
                    }`}
                >
                    {formatTime(message.timestamp)}
                </div>
            </div>
        </div>
    );
}

export default ChatMessage; 