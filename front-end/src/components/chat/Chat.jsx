import React, { useState, useEffect, useRef } from 'react';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import TypingIndicator from './TypingIndicator';


function Chat({ currentUser }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [typingUsers, setTypingUsers] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const pollingIntervalRef = useRef(null);
  const lastMessageTimestampRef = useRef(null);
  const supabaseChannelRef = useRef(null);

  console.log('Chat component rendered');

  const fetchLatestMessages = async () => {
    console.log('=== FETCHING INITIAL MESSAGES ===');
    try {
      let query = supabase
        .from('chat_messages')
        .select('*')
        .order('created_at', { ascending: true });

      if (lastMessageTimestampRef.current) {
        query = query.gt('created_at', lastMessageTimestampRef.current);
      }

      const { data, error } = await query;
      
      if (error) {
        console.error('Error fetching initial messages:', error);
        return;
      }
      
      console.log('Initial messages count:', data?.length || 0);
      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const startPolling = () => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }
    pollingIntervalRef.current = setInterval(fetchLatestMessages, 2000);
  };

  const stopPolling = () => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
  };

  // Initial setup and cleanup
  useEffect(() => {
    console.log('Initial setup effect running...');
    
    // Setup Supabase realtime subscription
    const setupSupabaseSubscription = () => {
      if (supabaseChannelRef.current) {
        console.log('Cleaning up existing Supabase channel...');
        supabase.removeChannel(supabaseChannelRef.current);
      }

      console.log('Setting up new Supabase realtime subscription...');
      const channel = supabase
        .channel('chat_messages')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'chat_messages'
          },
          (payload) => {
            console.log('=== NEW MESSAGE FROM SUPABASE REALTIME ===');
            console.log('Payload:', payload);
            setMessages(prev => {
              const exists = prev.some(msg => msg.id === payload.new.id);
              if (exists) {
                console.log('Message already exists in state, skipping:', payload.new.id);
                return prev;
              }
              console.log('Adding new message to state:', payload.new.id);
              return [...prev, payload.new];
            });
          }
        )
        .subscribe((status) => {
          console.log('Supabase subscription status:', status);
        });

      supabaseChannelRef.current = channel;
    };

    // Setup WebSocket
    const setupWebSocket = () => {
      if (socketRef.current?.readyState === WebSocket.OPEN) {
        console.log('WebSocket already connected, skipping setup...');
        return;
      }

      console.log('Setting up WebSocket connection...');
      socketRef.current = new WebSocket('ws://localhost:8080/ws');

      socketRef.current.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);
        stopPolling();
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
          reconnectTimeoutRef.current = null;
        }
      };

      socketRef.current.onmessage = (event) => {
        const msg = JSON.parse(event.data);
        if (msg.type === 'typing') {
          setTypingUsers((prev) => {
            const otherUsers = new Set(prev);
            if (msg.username && msg.username !== currentUser.username) {
              otherUsers.add(msg.username);
            }
            return [...otherUsers];
          });

          setTimeout(() => {
            setTypingUsers((prev) => prev.filter(u => u !== msg.username));
          }, 3000);
        }
      };

      socketRef.current.onclose = () => {
        console.log('WebSocket disconnected');
        setIsConnected(false);
        startPolling();
        reconnectTimeoutRef.current = setTimeout(setupWebSocket, 5000);
      };

      socketRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        socketRef.current.close();
      };
    };

    // Initialize everything
    fetchLatestMessages();
    setupSupabaseSubscription();
    setupWebSocket();

    // Cleanup function
    return () => {
      console.log('Cleaning up component...');
      if (socketRef.current) {
        socketRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      if (supabaseChannelRef.current) {
        supabase.removeChannel(supabaseChannelRef.current);
      }
      stopPolling();
    };
  }, [currentUser.username]); // Only re-run if currentUser.username changes

  const handleMessageChange = (e) => {
    setNewMessage(e.target.value);

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({
        type: 'typing',
        username: currentUser.username,
      }));
    }

    typingTimeoutRef.current = setTimeout(() => {
      setTypingUsers((prev) => prev.filter(u => u !== currentUser.username));
    }, 3000);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    console.log('=== SENDING MESSAGE VIA SUPABASE ===');
    console.log('Message content:', newMessage);
    
  //   try {
  //     const { data, error } = await supabase
  //       .from('chat_messages')
  //       .insert([{
  //         message: newMessage,
  //         username: currentUser.username,
  //         email: currentUser.email,
  //       }])
  //       .select();
      
  //     if (error) {
  //       console.error('Error sending message:', error);
  //       throw error;
  //     }
      
  //     console.log('Message successfully inserted into Supabase (will be displayed via realtime listener). Data:', data);
  //     setNewMessage(''); // Clear input regardless of immediate UI update
  //   } catch (error) {
  //     console.error('Error in handleSendMessage:', error);
  //   }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <ChatMessage
            key={message.id || index}
            message={message}
            isCurrentUser={message.email === currentUser.email}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-gray-700">
        {!isConnected && (
          <div className="text-red-500 text-sm mb-2">
            Reconnecting to chat server...
          </div>
        )}
        <TypingIndicator typingUsers={typingUsers} />
        <ChatInput
          newMessage={newMessage}
          onMessageChange={handleMessageChange}
          // onSendMessage={handleSendMessage}
          disabled={!isConnected}
        />
      </div>
    </div>
  );
}

export default Chat;
