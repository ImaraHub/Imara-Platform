package main

import (
	"log"
	"net/http"
)

// CORS middleware to allow requests from http://localhost:3000
func corsMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "http://localhost:3000")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}
		next.ServeHTTP(w, r)
	})
}

func main() {
	hub := NewHub()
	go hub.Run()

	http.HandleFunc("/ws", func(w http.ResponseWriter, r *http.Request) {
		ServeWs(hub, w, r)
	})

	http.HandleFunc("/api/chat/message", HandleChatMessage(hub))

	fs := http.FileServer(http.Dir("./static"))
	http.Handle("/", fs)

	// Wrap the default mux with the CORS middleware
	log.Println("Server started at http://localhost:8080")
	if err := http.ListenAndServe(":8080", corsMiddleware(http.DefaultServeMux)); err != nil {
		log.Fatal("ListenAndServe:", err)
	}
}
