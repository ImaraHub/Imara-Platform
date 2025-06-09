import React, { useState, useEffect, useRef } from 'react';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import TypingIndicator from './TypingIndicator';
import { supabase } from '../../lib/supabase';

function Chat({ currentUser }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [typingUsers, setTypingUsers] = useState([]);
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    // Connect to WebSocket server
    socketRef.current = new WebSocket('ws://localhost:8080/ws');

    socketRef.current.onopen = () => {
      console.log('WebSocket connected');
    };

    socketRef.current.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.type === 'message') {
        setMessages((prev) => [...prev, msg]);
      } else if (msg.type === 'typing') {
        setTypingUsers((prev) => {
          const otherUsers = new Set(prev);
          if (msg.username && msg.username !== currentUser.username) {
            otherUsers.add(msg.username);
          }
          return [...otherUsers];
        });

        // Clear typing indicator after a few seconds
        setTimeout(() => {
          setTypingUsers((prev) => prev.filter(u => u !== msg.username));
        }, 3000);
      }
    };

    socketRef.current.onclose = () => {
      console.log('WebSocket disconnected');
    };

    return () => {
      socketRef.current.close();
    };
  }, [currentUser.username]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleMessageChange = (e) => {
    setNewMessage(e.target.value);

    // Send typing event
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    if (socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({
        type: 'typing',
        username: currentUser.username,
      }));
    }

    typingTimeoutRef.current = setTimeout(() => {
      setTypingUsers((prev) => prev.filter(u => u !== currentUser.username));
    }, 3000);
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const messagePayload = {
      type: 'message',
      content: newMessage,
      user_id: currentUser.id,
      sender_name: currentUser.username,
    };

    if (socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify(messagePayload));
      setNewMessage('');
    }
  };

  useEffect(() => {
    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('project_id', currentProjectId)
        .order('created_at', { ascending: true });
      if (data) {
        setMessages(data);
      } else if (error) {
        console.error('Error fetching messages:', error);
      }
    };

    fetchMessages();
  }, [currentProjectId]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <ChatMessage
            key={index}
            message={message}
            isCurrentUser={message.user_id === currentUser.id}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-gray-700">
        <TypingIndicator typingUsers={typingUsers} />
        <ChatInput
          newMessage={newMessage}
          onMessageChange={handleMessageChange}
          onSendMessage={handleSendMessage}
        />
      </div>
    </div>
  );
}

export default Chat;
