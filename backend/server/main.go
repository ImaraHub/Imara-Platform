package main

import (
	"fmt"
	"net/http"
	"os"

	handlers "server/handlers"

	"github.com/gorilla/mux"
	// "github.com/joho/godotenv"
	"github.com/supabase-community/supabase-go"
)

func main() {
	// Replace with your Supabase project URL and API key
	// err := godotenv.Load()
	// if err != nil {
	// 	fmt.Println("Error loading .env file")
	// 	return
	// }
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

	// // Example: Fetch data from a table
	// _, response, err := client.From("users").Select("*", "", false).Execute()
	// if err != nil {
	// 	fmt.Println("Error fetching data:", err)
	// 	return
	// }

	// fmt.Println("Response:", response)

	// convert the  byte to character?

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

	fmt.Println("Server starting on :8000")
	http.ListenAndServe(":8000", r)
}
