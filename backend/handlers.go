package main

import (
	"log"
	"net/http"

	"github.com/gorilla/websocket"
)

// WebSocket upgrader config
var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true // Allow any origin for dev
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
