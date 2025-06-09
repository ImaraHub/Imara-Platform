package chat

import (
	"sync"
	"time"

	"github.com/gorilla/websocket"
)

// Hub maintains the set of active clients and broadcasts messages
type Hub struct {
	// Registered clients
	Clients map[string]*Client

	// Register requests from the clients
	Register chan *Client

	// Unregister requests from clients
	Unregister chan *Client

	// Broadcast channel for messages
	Broadcast chan *Message

	// Mutex for thread-safe operations
	mutex *sync.RWMutex

	// Database connection
	db *Database
}

// NewHub creates a new Hub instance
func NewHub(db *Database) *Hub {
	return &Hub{
		Clients:    make(map[string]*Client),
		Register:   make(chan *Client),
		Unregister: make(chan *Client),
		Broadcast:  make(chan *Message),
		mutex:      &sync.RWMutex{},
		db:         db,
	}
}

// Run starts the hub
func (h *Hub) Run() {
	for {
		select {
		case client := <-h.Register:
			h.mutex.Lock()
			h.Clients[client.ID] = client
			h.mutex.Unlock()

			// Update online status
			h.db.UpdateOnlineStatus(client.UserID, true)

			// Broadcast user online status
			h.Broadcast <- &Message{
				Type:    "status",
				UserID:  client.UserID,
				Content: "online",
			}

		case client := <-h.Unregister:
			h.mutex.Lock()
			if _, ok := h.Clients[client.ID]; ok {
				delete(h.Clients, client.ID)
				close(client.Send)
			}
			h.mutex.Unlock()

			// Update online status
			h.db.UpdateOnlineStatus(client.UserID, false)

			// Broadcast user offline status
			h.Broadcast <- &Message{
				Type:    "status",
				UserID:  client.UserID,
				Content: "offline",
			}

		case message := <-h.Broadcast:
			// Handle different message types
			switch message.Type {
			case "message":
				// Save message to database
				if err := h.db.SaveMessage(message); err != nil {
					// Handle error
					continue
				}

				// Broadcast to specific receiver if it's a private message
				if message.ReceiverID != "" {
					h.mutex.RLock()
					if client, ok := h.Clients[message.ReceiverID]; ok {
						client.Send <- message
					}
					h.mutex.RUnlock()
				} else {
					// Broadcast to all clients
					h.mutex.RLock()
					for _, client := range h.Clients {
						client.Send <- message
					}
					h.mutex.RUnlock()
				}

			case "typing":
				// Update typing status in database
				h.db.UpdateTypingStatus(message.UserID, message.ReceiverID, true)

				// Send typing status to receiver
				if message.ReceiverID != "" {
					h.mutex.RLock()
					if client, ok := h.Clients[message.ReceiverID]; ok {
						client.Send <- message
					}
					h.mutex.RUnlock()
				}

			case "status":
				// Broadcast status to all clients
				h.mutex.RLock()
				for _, client := range h.Clients {
					client.Send <- message
				}
				h.mutex.RUnlock()
			}
		}
	}
}

// GetOnlineUsers returns a list of online users
func (h *Hub) GetOnlineUsers() []string {
	h.mutex.RLock()
	defer h.mutex.RUnlock()

	users := make([]string, 0, len(h.Clients))
	for _, client := range h.Clients {
		users = append(users, client.UserID)
	}
	return users
}

// CleanupDeadConnections removes dead connections
func (h *Hub) CleanupDeadConnections() {
	ticker := time.NewTicker(30 * time.Second)
	for range ticker.C {
		h.mutex.Lock()
		for id, client := range h.Clients {
			if err := client.Conn.WriteMessage(websocket.PingMessage, nil); err != nil {
				close(client.Send)
				delete(h.Clients, id)
				h.db.UpdateOnlineStatus(client.UserID, false)
			}
		}
		h.mutex.Unlock()
	}
} 