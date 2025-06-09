package main

import (
	"encoding/json"
	"fmt"
	"net/http"
	"os"

	"github.com/gorilla/mux"
	"github.com/joho/godotenv"
	"github.com/supabase-community/supabase-go"
)

type Timeline struct {
	ProjectID   string `json:"project_id"`
	StartDate   string `json:"start_date"`
	EndDate     string `json:"end_date"`
	Description string `json:"description"`
}

type Milestone struct {
	ID          string `json:"id"`
	ProjectID   string `json:"project_id"`
	Title       string `json:"title"`
	Description string `json:"description"`
	DueDate     string `json:"due_date"`
	Status      string `json:"status"`
	CreatedBy   string `json:"created_by"`
	CreatedAt   string `json:"created_at"`
	UpdatedAt   string `json:"updated_at"`
}

type CreateMilestoneRequest struct {
	ProjectID   string `json:"project_id"`
	Title       string `json:"title"`
	Description string `json:"description"`
	DueDate     string `json:"due_date"`
	CreatedBy   string `json:"created_by"`
}

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
	r.Use(func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			w.Header().Set("Access-Control-Allow-Origin", "*")
			w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
			w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
			if r.Method == "OPTIONS" {
				w.WriteHeader(http.StatusOK)
				return
			}
			next.ServeHTTP(w, r)
		})
	})

	// Timeline endpoint
	r.HandleFunc("/api/timeline", func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
			return
		}

		var timeline Timeline
		if err := json.NewDecoder(r.Body).Decode(&timeline); err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}

		// Insert into Supabase
		_, response, err := client.From("project_timelines").Insert(timeline, false, "", "", "").Execute()
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(response)
	}).Methods("POST", "OPTIONS")

	// Get milestones endpoint
	r.HandleFunc("/api/projects/{projectId}/milestones", func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodGet {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
			return
		}

		vars := mux.Vars(r)
		projectId := vars["projectId"]

		// Fetch milestones from Supabase
		_, response, err := client.From("milestones").
			Select("*", "", false).
			Eq("project_id", projectId).
			Execute()
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(response)
	}).Methods("GET", "OPTIONS")

	// Create milestone endpoint
	r.HandleFunc("/api/milestones", func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
			return
		}

		var milestoneReq CreateMilestoneRequest
		if err := json.NewDecoder(r.Body).Decode(&milestoneReq); err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}

		// Create milestone in Supabase
		milestone := map[string]interface{}{
			"project_id":  milestoneReq.ProjectID,
			"title":       milestoneReq.Title,
			"description": milestoneReq.Description,
			"due_date":    milestoneReq.DueDate,
			"status":      "pending",
			"created_by":  milestoneReq.CreatedBy,
		}

		_, _, err := client.From("milestones").Insert(milestone, false, "", "", "").Execute()
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		// Return the created milestone
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(milestone)
	}).Methods("POST", "OPTIONS")

	// Get project timeline endpoint
	r.HandleFunc("/api/projects/{projectId}/timeline", func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodGet {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
			return
		}

		vars := mux.Vars(r)
		projectId := vars["projectId"]

		// Fetch timeline from Supabase
		_, response, err := client.From("project_timelines").
			Select("*", "", false).
			Eq("project_id", projectId).
			Execute()
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(response)
	}).Methods("GET", "OPTIONS")

	fmt.Println("Server starting on :8080")
	http.ListenAndServe(":8080", r)
}
