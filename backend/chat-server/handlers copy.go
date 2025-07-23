package main

import (
	"log"
	"net/http"
	"os"
	"bytes"
	"encoding/json"

	"github.com/gorilla/websocket"
)

// WebSocket upgrader config
var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		// Allow only the frontend origin in development. Change for production!
		origin := r.Header.Get("Origin")
		return origin == "*"
	},
}

// Message is the structure sent/received via WebSocket
type Message struct {
	Type     string `json:"type"` // "message" or "typing"
	Message  string `json:"message,omitempty"`
	Username string `json:"username"`
	Email    string `json:"email"`
	IsTyping bool   `json:"is_typing,omitempty"`
}

// Client is a single WebSocket connection
type Client struct {
	hub  *Hub
	conn *websocket.Conn
	send chan Message
}

// Read messages from client
func (c *Client) readPump() {
	defer func() {
		c.hub.unregister <- c
		c.conn.Close()
	}()
	for {
		var msg Message
		if err := c.conn.ReadJSON(&msg); err != nil {
			log.Println("read error:", err)
			break
		}
		switch msg.Type {
		case "message":
			c.hub.broadcast <- msg
		case "typing":
			c.hub.broadcast <- msg
		}
	}
}

// Write messages to client
func (c *Client) writePump() {
	for msg := range c.send {
		if err := c.conn.WriteJSON(msg); err != nil {
			log.Println("write error:", err)
			break
		}
	}
	c.conn.Close()
}

// Hub keeps track of all clients
type Hub struct {
	clients    map[*Client]bool
	broadcast  chan Message
	register   chan *Client
	unregister chan *Client
}

// NewHub creates a Hub
func NewHub() *Hub {
	return &Hub{
		clients:    make(map[*Client]bool),
		broadcast:  make(chan Message),
		register:   make(chan *Client),
		unregister: make(chan *Client),
	}
}

// Run the Hub
func (h *Hub) Run() {
	for {
		select {
		case client := <-h.register:
			h.clients[client] = true
		case client := <-h.unregister:
			if _, ok := h.clients[client]; ok {
				delete(h.clients, client)
				close(client.send)
			}
		case message := <-h.broadcast:
			for client := range h.clients {
				select {
				case client.send <- message:
				default:
					close(client.send)
					delete(h.clients, client)
				}
			}
		}
	}
}

// ServeWs upgrades HTTP to WebSocket and registers the client
func ServeWs(hub *Hub, w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println("WebSocket upgrade error:", err)
		return
	}
	client := &Client{hub: hub, conn: conn, send: make(chan Message)}
	hub.register <- client

	go client.writePump()
	go client.readPump()
}

// ChatMessagePayload represents the expected payload for chat messages
// (matches your Supabase schema)
type ChatMessagePayload struct {
	ProjectID       string `json:"project_id,omitempty"`
	UserID          string `json:"user_id,omitempty"`
	Message         string `json:"message"`
	Username        string `json:"username,omitempty"`
	Email           string `json:"email,omitempty"`
	IsSystemMessage bool   `json:"is_system_message,omitempty"`
}

// Handler for POST /api/chat/message
func HandleChatMessage(hub *Hub) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			w.WriteHeader(http.StatusMethodNotAllowed)
			return
		}

		var payload ChatMessagePayload
		if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
			w.WriteHeader(http.StatusBadRequest)
			w.Write([]byte(`{"error": "invalid JSON"}`))
			return
		}

		supabaseURL := os.Getenv("SUPABASE_URL")
		supabaseKey := os.Getenv("SUPABASE_PUBLIC_KEY")
		if supabaseURL == "" || supabaseKey == "" {
			w.WriteHeader(http.StatusInternalServerError)
			w.Write([]byte(`{"error": "Supabase credentials not set"}`))
			return
		}

		// Prepare the request to Supabase REST API
		apiURL := supabaseURL + "/rest/v1/chat_messages"
		jsonBody, _ := json.Marshal(payload)
		req, err := http.NewRequest("POST", apiURL, bytes.NewBuffer(jsonBody))
		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			w.Write([]byte(`{"error": "failed to create request"}`))
			return
		}
		req.Header.Set("apikey", supabaseKey)
		req.Header.Set("Authorization", "Bearer "+supabaseKey)
		req.Header.Set("Content-Type", "application/json")

		client := &http.Client{}
		resp, err := client.Do(req)
		if err != nil {
			w.WriteHeader(http.StatusBadGateway)
			w.Write([]byte(`{"error": "failed to contact Supabase"}`))
			return
		}
		defer resp.Body.Close()

		if resp.StatusCode >= 200 && resp.StatusCode < 300 {
			// Broadcast the message to all WebSocket clients
			msg := Message{
				Type:     "message",
				Message:  payload.Message,
				Username: payload.Username,
				Email:    payload.Email,
			}
			hub.broadcast <- msg
			w.WriteHeader(http.StatusCreated)
			w.Write([]byte(`{"success": true}`))
		} else {
			w.WriteHeader(http.StatusBadGateway)
			w.Write([]byte(`{"error": "Supabase error"}`))
		}
	}
}
