package main

import (
	"fmt"
	"net/http"
	"os"

	handlers "server/handlers"

	"github.com/gorilla/mux"
	"github.com/joho/godotenv"

	// "github.com/joho/godotenv"
	"github.com/supabase-community/supabase-go"
)

func main() {
	// Replace with your Supabase project URL and API key
	err := godotenv.Load()
	if err != nil {
		fmt.Println("Error loading .env file")
		return
	}
	API_URL := os.Getenv("SUPABASE_URL")
	API_KEY := os.Getenv("SUPABASE_PUBLIC_KEY")
	if API_URL == "" || API_KEY == "" {
		fmt.Println("Please set SUPABASE_URL and SUPABASE_KEY in your .env file")
		return
	}
	// Initialize the Supabase client
	client, err := supabase.NewClient(API_URL, API_KEY, &supabase.ClientOptions{})
	if err != nil {
		fmt.Println("cannot initialize client", err)
		return
	}



	r := mux.NewRouter()

	// Add CORS middleware
	r.Use(handlers.CORSMiddleware)

	// Timeline endpoint
	r.HandleFunc("/api/timeline", handlers.TimelineHandler(client)).Methods("POST", "OPTIONS")

	// Get milestones endpoint
	r.HandleFunc("/api/projects/{projectId}/milestones", handlers.GetMilestonesHandler(client)).Methods("GET", "OPTIONS")

	// Create milestone endpoint
	r.HandleFunc("/api/milestones", handlers.CreateMilestoneHandler(client)).Methods("POST", "OPTIONS")

	// Get project timeline endpoint
	r.HandleFunc("/api/projects/{projectId}/timeline", handlers.GetProjectTimelineHandler(client)).Methods("GET", "OPTIONS")

	// Update timeline endpoint
	r.HandleFunc("/api/timeline/{id}", handlers.UpdateTimelineHandler(client)).Methods("PUT", "OPTIONS")

	// Create task endpoint
	r.HandleFunc("/api/milestones/{milestoneId}/tasks", handlers.TaskHandler(client)).Methods("GET", "POST", "OPTIONS")

	// Update task endpoint
	r.HandleFunc("/api/tasks/{taskId}", handlers.UpdateTaskHandler(client)).Methods("PUT", "OPTIONS")

	// Review task endpoint
	r.HandleFunc("/api/tasks/{taskId}/review", handlers.ReviewTaskHandler(client)).Methods("POST", "OPTIONS")

	// Upload task evidence endpoint
	r.HandleFunc("/api/tasks/{taskId}/evidence", handlers.UploadTaskEvidenceHandler(client)).Methods("POST", "OPTIONS")

	// M-Pesa endpoints
	r.HandleFunc("/api/mpesa/initiate", handlers.InitiateMpesaPaymentHandler()).Methods("POST", "OPTIONS")
	r.HandleFunc("/api/mpesa/status/{orderID}", handlers.PollPaymentStatusHandler()).Methods("GET", "OPTIONS")

	// Swypt crypto transfer endpoint
	r.HandleFunc("/api/swypt/crypto-transfer", handlers.ProcessCryptoTransferHandler()).Methods("POST", "OPTIONS")

	// Swypt quote endpoint
	r.HandleFunc("/api/swypt/quotes", handlers.GetSwyptQuoteHandler()).Methods("POST", "OPTIONS")

	// Swypt supported assets endpoint
	r.HandleFunc("/api/swypt/supported-assets", handlers.GetSwyptSupportedAssetsHandler()).Methods("GET", "OPTIONS")

	// Swypt offramp endpoint
	r.HandleFunc("/api/swypt/offramp", handlers.SwyptOfframpHandler()).Methods("POST", "OPTIONS")

	fmt.Println("Server starting on :8000")
	http.ListenAndServe(":8000", r)
}
