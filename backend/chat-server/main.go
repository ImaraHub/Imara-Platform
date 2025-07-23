package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
)



// CORS middleware to allow requests from http://localhost:3000
func corsMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", os.Getenv("APP_BASE_URL"))
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
	LoadConfig()
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

func LoadConfig() {
	//  read the config file
	configFile, err := os.Open("config.json")
	if err != nil {
		fmt.Println("Error opening config file:", err)
		return
	}
	defer configFile.Close()
	decoder := json.NewDecoder(configFile)
	var config map[string]string
	err = decoder.Decode(&config)
	if err != nil {
		fmt.Println("Error decoding config file:", err)
		return
	}
	// Set environment variables
	for key, value := range config {
		err := os.Setenv(key, value)
		if err != nil {
			fmt.Printf("Error setting environment variable %s: %v\n", key, err)
			return
		}
	}
}
