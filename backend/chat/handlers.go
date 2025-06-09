package chat

import (
	"context"
	"encoding/json"
	"net/http"
	"time"

	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin: func(r *http.Request) bool {
		// Allow requests from localhost:3000
		return r.Header.Get("Origin") == "http://localhost:3000"
	},
}

// CORS middleware
func corsMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Set CORS headers
		w.Header().Set("Access-Control-Allow-Origin", "http://localhost:3000")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
		w.Header().Set("Access-Control-Allow-Credentials", "true")

		// Handle preflight requests
		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}

		next.ServeHTTP(w, r)
	})
}

// Handlers contains all HTTP handlers
type Handlers struct {
	hub *Hub
	db  Database
}

// NewHandlers creates a new Handlers instance
func NewHandlers(hub *Hub, db Database) *Handlers {
	return &Handlers{
		hub: hub,
		db:  db,
	}
}

// ServeWS handles WebSocket connections
func (h *Handlers) ServeWS(w http.ResponseWriter, r *http.Request) {
	// Get user from context (set by auth middleware)
	userID := r.Context().Value("user_id").(string)
	username := r.Context().Value("username").(string)

	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		http.Error(w, "Could not upgrade connection", http.StatusInternalServerError)
		return
	}

	client := &Client{
		ID:       userID,
		Hub:      h.hub,
		Conn:     conn,
		Send:     make(chan *Message, 256),
		UserID:   userID,
		Username: username,
	}

	client.Hub.Register <- client

	// Start goroutines for reading and writing
	go client.WritePump()
	go client.ReadPump()
}

// GetMessageHistory handles message history requests
func (h *Handlers) GetMessageHistory(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value("user_id").(string)
	receiverID := r.URL.Query().Get("receiver_id")
	limit := 50 // Default limit
	offset := 0 // Default offset

	messages, err := h.db.GetMessageHistory(userID, receiverID, limit, offset)
	if err != nil {
		http.Error(w, "Could not fetch message history", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(messages)
}

// GetOnlineUsers handles online users requests
func (h *Handlers) GetOnlineUsers(w http.ResponseWriter, r *http.Request) {
	users, err := h.db.GetOnlineUsers()
	if err != nil {
		http.Error(w, "Could not fetch online users", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(users)
}

// AuthMiddleware handles authentication
func (h *Handlers) AuthMiddleware(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		// TODO: Implement proper authentication
		// For now, we'll use a dummy user
		ctx := r.Context()
		ctx = context.WithValue(ctx, "user_id", "1")
		ctx = context.WithValue(ctx, "username", "test_user")
		next.ServeHTTP(w, r.WithContext(ctx))
	}
}

// RegisterRoutes registers all chat routes
func (h *Handlers) RegisterRoutes(mux *http.ServeMux) {
	// Apply CORS middleware to all routes
	mux.Handle("/ws", corsMiddleware(h.AuthMiddleware(h.ServeWS)))
	mux.Handle("/messages", corsMiddleware(h.AuthMiddleware(h.GetMessageHistory)))
	mux.Handle("/users/online", corsMiddleware(h.AuthMiddleware(h.GetOnlineUsers)))
} 