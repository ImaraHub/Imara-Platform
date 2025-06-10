package main

import (
	"log"
	"net/http"
	"os"
	"bytes"
	"encoding/json"
	"fmt"

	"github.com/gorilla/websocket"
)

// WebSocket upgrader config
var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		// Allow only the frontend origin in development. Change for production!
		origin := r.Header.Get("Origin")
		return origin == "http://localhost:3000"
	},
}

// Message is the structure sent/received via WebSocket
type Message struct {
	Type     string `json:"type"` // "message" or "typing"
	ID       string `json:"id,omitempty"` // Add ID field
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
		
		// Save message to database first and get ID
		if msg.Type == "message" {
			payload := ChatMessagePayload{
				Message:  msg.Message,
				Username: msg.Username,
				Email:    msg.Email,
			}
			
			// Save to Supabase and get the ID
			supabaseID, err := saveMessageToSupabase(payload)
			if err != nil {
				log.Printf("Error saving message to Supabase: %v", err)
				continue
			}
			// Assign the Supabase ID to the message before broadcasting
			msg.ID = supabaseID
		}
		
		// Broadcast to all clients
		c.hub.broadcast <- msg
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

// Helper function to save message to Supabase and return its ID
func saveMessageToSupabase(payload ChatMessagePayload) (string, error) {
	supabaseURL := os.Getenv("SUPABASE_URL")
	supabaseKey := os.Getenv("SUPABASE_SERVICE_KEY")
	
	if supabaseURL == "" || supabaseKey == "" {
		return "", fmt.Errorf("Supabase credentials not set")
	}
	
	apiURL := supabaseURL + "/rest/v1/chat_messages"
	jsonBody, _ := json.Marshal(payload)
	
	req, err := http.NewRequest("POST", apiURL, bytes.NewBuffer(jsonBody))
	if err != nil {
		return "", err
	}
	
	req.Header.Set("apikey", supabaseKey)
	req.Header.Set("Authorization", "Bearer "+supabaseKey)
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Prefer", "return=representation") // Request the inserted row back
	
	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()
	
	if resp.StatusCode >= 200 && resp.StatusCode < 300 {
		var result []struct { // Supabase returns an array of the inserted row
			ID string `json:"id"`
		} 
		if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
			return "", fmt.Errorf("failed to decode Supabase response: %w", err)
		}
		if len(result) > 0 {
			return result[0].ID, nil
		}
		return "", fmt.Errorf("no ID returned from Supabase")
	}
	
	return "", fmt.Errorf("Supabase error: %d", resp.StatusCode)
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
		supabaseKey := os.Getenv("SUPABASE_SERVICE_KEY")
		if supabaseURL == "" || supabaseKey == "" {
			w.WriteHeader(http.StatusInternalServerError)
			w.Write([]byte(`{"error": "Supabase credentials not set"}`))
			return
		}

		// Prepare the request to Supabase REST API and save message
		supabaseID, err := saveMessageToSupabase(payload)
		if err != nil {
			log.Printf("Error saving message to Supabase via HTTP handler: %v", err)
			w.WriteHeader(http.StatusInternalServerError)
			w.Write([]byte(fmt.Sprintf(`{"error": "failed to save message: %v"}`, err)))
			return
		}

		// Broadcast the message to all WebSocket clients
		msg := Message{
			Type:     "message",
			ID:       supabaseID, // Include the Supabase ID
			Message:  payload.Message,
			Username: payload.Username,
			Email:    payload.Email,
		}
		hub.broadcast <- msg
		w.WriteHeader(http.StatusCreated)
		w.Write([]byte(`{"success": true}`))
	}
}