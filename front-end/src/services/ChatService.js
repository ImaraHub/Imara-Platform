class ChatService {
    
    constructor() {
        this.ws = null;
        this.messageHandlers = new Set();
        this.statusHandlers = new Set();
        this.typingHandlers = new Set();
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectDelay = 1000;
        this.baseUrl = 'http://localhost:8080';
    }

    connect(userId, username) {
        this.userId = userId;
        this.username = username;
        this.connectWebSocket();
    }

    connectWebSocket() {
        const wsUrl = `ws://${window.location.hostname}:8080/ws`;
        this.ws = new WebSocket(wsUrl);

        this.ws.onopen = () => {
            console.log('WebSocket connected');
            this.reconnectAttempts = 0;
        };

        this.ws.onmessage = (event) => {
            const message = JSON.parse(event.data);
            this.handleMessage(message);
        };

        this.ws.onclose = () => {
            console.log('WebSocket disconnected');
            this.handleReconnect();
        };

        this.ws.onerror = (error) => {
            console.error('WebSocket error:', error);
        };
    }

    handleReconnect() {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            setTimeout(() => {
                console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
                this.connectWebSocket();
            }, this.reconnectDelay * this.reconnectAttempts);
        }
    }

    handleMessage(message) {
        switch (message.type) {
            case 'message':
                this.messageHandlers.forEach(handler => handler(message));
                break;
            case 'status':
                this.statusHandlers.forEach(handler => handler(message));
                break;
            case 'typing':
                this.typingHandlers.forEach(handler => handler(message));
                break;
        }
    }

    sendMessage(content, receiverId = null) {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            const message = {
                type: 'message',
                content,
                receiver_id: receiverId,
            };
            this.ws.send(JSON.stringify(message));
        }
    }

    sendTypingStatus(receiverId) {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            const message = {
                type: 'typing',
                receiver_id: receiverId,
            };
            this.ws.send(JSON.stringify(message));
        }
    }

    onMessage(handler) {
        this.messageHandlers.add(handler);
        return () => this.messageHandlers.delete(handler);
    }

    onStatus(handler) {
        this.statusHandlers.add(handler);
        return () => this.statusHandlers.delete(handler);
    }

    onTyping(handler) {
        this.typingHandlers.add(handler);
        return () => this.typingHandlers.delete(handler);
    }

    async getMessageHistory(receiverId, limit = 50, offset = 0) {
        const response = await fetch(
            `${this.baseUrl}/messages?receiver_id=${receiverId}&limit=${limit}&offset=${offset}`,
            {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        );
        if (!response.ok) {
            throw new Error('Failed to fetch message history');
        }
        return response.json();
    }

    async getOnlineUsers() {
        const response = await fetch(`${this.baseUrl}/users/online`, {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        if (!response.ok) {
            throw new Error('Failed to fetch online users');
        }
        return response.json();
    }

    disconnect() {
        if (this.ws) {
            this.ws.close();
        }
    }
}

export const chatService = new ChatService(); 