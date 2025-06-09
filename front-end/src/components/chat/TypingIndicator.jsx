import React from 'react';

function TypingIndicator({ typingUsers }) {
  if (!typingUsers.length) return null;

  return (
    <div className="text-sm text-gray-400 italic">
      {typingUsers.length === 1
        ? `${typingUsers[0]} is typing...`
        : `${typingUsers.join(', ')} are typing...`}
    </div>
  );
}

export default TypingIndicator; 