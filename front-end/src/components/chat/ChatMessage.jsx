import React from 'react';

function ChatMessage({ message, isCurrentUser }) {
  return (
    <div className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[70%] rounded-lg px-4 py-2 ${
          isCurrentUser
            ? 'bg-blue-500 text-white'
            : 'bg-gray-700 text-gray-100'
        }`}
      >
        <div className="text-sm font-medium mb-1">
          {message.sender_name}
        </div>
        <div className="text-sm">{message.content}</div>
        <div className="text-xs mt-1 opacity-70">
          {new Date(message.created_at).toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
}

export default ChatMessage; 