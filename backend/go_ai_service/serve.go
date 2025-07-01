package main

import (
	"net/http"
	"log"
)

func main() {
	fs := http.FileServer(http.Dir("."))
	log.Println("Serving on :8080")
	http.ListenAndServe(":8080", fs)
} 