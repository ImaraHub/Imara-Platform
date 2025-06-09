import React from 'react';

function TypingIndicator({ typingUsers }) {
    if (typingUsers.length === 0) return null;

    return (
        <div className="text-sm text-gray-400 mb-2">
            {typingUsers.length === 1 ? (
                <span>{typingUsers[0]} is typing...</span>
            ) : typingUsers.length === 2 ? (
                <span>{typingUsers[0]} and {typingUsers[1]} are typing...</span>
            ) : (
                <span>Several people are typing...</span>
            )}
        </div>
    );
}

export default TypingIndicator; 