import React from 'react';

function ChatInput({ 
  newMessage, 
  onMessageChange, 
  onSendMessage, 
  isTyping 
}) {
  return (
    <form onSubmit={onSendMessage} className="flex gap-4">
      <input
        type="text"
        value={newMessage}
        onChange={onMessageChange}
        placeholder="Type your message..."
        className="flex-1 bg-gray-900/50 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <button
        type="submit"
        disabled={!newMessage.trim()}
        className={`px-6 py-2 rounded-lg transition-colors ${
          newMessage.trim()
            ? 'bg-blue-500 text-white hover:bg-blue-600'
            : 'bg-gray-700 text-gray-400 cursor-not-allowed'
        }`}
      >
        Send
      </button>
    </form>
  );
}

export default ChatInput; 