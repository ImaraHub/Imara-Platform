package main

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"

	"github.com/gorilla/mux"
	"github.com/joho/godotenv"
	"github.com/supabase-community/supabase-go"
)

type Timeline struct {
	ID          string `json:"id"`
	ProjectID   string `json:"project_id"`
	StartDate   string `json:"start_date"`
	EndDate     string `json:"end_date"`
	Description string `json:"description"`
	CreatedAt   string `json:"created_at"`
	UpdatedAt   string `json:"updated_at"`
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

type Task struct {
	ID          string `json:"id"`
	MilestoneID string `json:"milestone_id"`
	Title       string `json:"title"`
	Description string `json:"description"`
	AssigneeID  string `json:"assignee_id"`
	DueDate     string `json:"due_date"`
	Status      string `json:"status"`
	Reviewed    bool   `json:"reviewed"`
	CreatedBy   string `json:"created_by"`
	CreatedAt   string `json:"created_at"`
	UpdatedAt   string `json:"updated_at"`
}

type CreateTaskRequest struct {
	MilestoneID string `json:"milestone_id"`
	Title       string `json:"title"`
	Description string `json:"description"`
	AssigneeID  string `json:"assignee_id"`
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
			w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
			w.Header().Set("Access-Control-Allow-Credentials", "true")

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
			fmt.Printf("Error decoding timeline request: %v\n", err)
			http.Error(w, fmt.Sprintf("Invalid request body: %v", err), http.StatusBadRequest)
			return
		}

		// Log the received timeline data
		fmt.Printf("Received timeline data: %+v\n", timeline)

		// Validate required fields
		if timeline.ProjectID == "" {
			http.Error(w, "Project ID is required", http.StatusBadRequest)
			return
		}
		if timeline.StartDate == "" {
			http.Error(w, "Start date is required", http.StatusBadRequest)
			return
		}
		if timeline.EndDate == "" {
			http.Error(w, "End date is required", http.StatusBadRequest)
			return
		}

		// Insert into Supabase
		_, response, err := client.From("project_timelines").Insert(timeline, false, "", "", "").Execute()
		if err != nil {
			fmt.Printf("Error inserting timeline into Supabase: %v\n", err)
			http.Error(w, fmt.Sprintf("Database error: %v", err), http.StatusInternalServerError)
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

		// Add CORS headers
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

		// Handle preflight requests
		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}

		// Fetch milestones from Supabase
		data, _, err := client.From("milestones").
			Select("*", "", false).
			Eq("project_id", projectId).
			Execute()
		if err != nil {
			fmt.Printf("Error fetching milestones: %v\n", err)
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		// Debug logging
		// fmt.Printf("Raw milestones data: %s\n", string(data))

		// Parse the milestones data
		var milestones []Milestone
		if err := json.Unmarshal(data, &milestones); err != nil {
			fmt.Printf("Error unmarshaling milestones: %v\n", err)
			http.Error(w, "Error processing milestones data", http.StatusInternalServerError)
			return
		}

		// Debug logging
		// fmt.Printf("Parsed milestones: %+v\n", milestones)

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(milestones)
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
		data, _, err := client.From("project_timelines").
			Select("*", "", false).
			Eq("project_id", projectId).
			Execute()

		if err != nil {
			fmt.Printf("Error fetching timeline: %v\n", err)
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		// Debug logging
		fmt.Printf("Project ID: %s\n", projectId)
		fmt.Printf("Raw timeline data: %s\n", string(data))

		// Decode the byte array into a string
		var timelineData []Timeline
		if err := json.Unmarshal(data, &timelineData); err != nil {
			fmt.Printf("Error unmarshaling timeline data: %v\n", err)
			http.Error(w, "Error processing timeline data", http.StatusInternalServerError)
			return
		}

		// Check if we got any data
		if len(timelineData) == 0 {
			w.Header().Set("Content-Type", "application/json")
			json.NewEncoder(w).Encode(map[string]interface{}{}) // Return empty object if no data
			return
		}

		// Return the first timeline found
		responseData := map[string]interface{}{
			"start_date":  timelineData[0].StartDate,
			"end_date":    timelineData[0].EndDate,
			"description": timelineData[0].Description,
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(responseData)
	}).Methods("GET", "OPTIONS")

	// Update timeline endpoint
	r.HandleFunc("/api/timeline/{id}", func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPut {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
			return
		}

		vars := mux.Vars(r)
		timelineId := vars["id"]

		var timeline Timeline
		if err := json.NewDecoder(r.Body).Decode(&timeline); err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}

		// Update in Supabase
		_, _, err := client.From("project_timelines").
			Update(timeline, "", "").
			Eq("id", timelineId).
			Execute()

		if err != nil {
			fmt.Printf("Error updating timeline: %v\n", err)
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(timeline)
	}).Methods("PUT", "OPTIONS")

	// Create task endpoint
	r.HandleFunc("/api/milestones/{milestoneId}/tasks", func(w http.ResponseWriter, r *http.Request) {
		vars := mux.Vars(r)
		milestoneId := vars["milestoneId"]

		if r.Method == http.MethodGet {
			// Fetch tasks from Supabase
			data, _, err := client.From("milestone_tasks").
				Select("*", "", false).
				Eq("milestone_id", milestoneId).
				Execute()

			if err != nil {
				fmt.Printf("Error fetching tasks: %v\n", err)
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}

			// Parse the tasks data
			var tasks []Task
			if err := json.Unmarshal(data, &tasks); err != nil {
				fmt.Printf("Error unmarshaling tasks: %v\n", err)
				http.Error(w, "Error processing tasks data", http.StatusInternalServerError)
				return
			}

			w.Header().Set("Content-Type", "application/json")
			json.NewEncoder(w).Encode(tasks)
			return
		}

		if r.Method != http.MethodPost {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
			return
		}

		var taskReq CreateTaskRequest
		if err := json.NewDecoder(r.Body).Decode(&taskReq); err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}

		// Create task in Supabase
		task := map[string]interface{}{
			"milestone_id": milestoneId,
			"title":        taskReq.Title,
			"description":  taskReq.Description,
			"assignee_id":  taskReq.AssigneeID,
			"due_date":     taskReq.DueDate,
			"status":       "pending",
			"reviewed":     false,
			"created_by":   taskReq.CreatedBy,
		}

		data, _, err := client.From("milestone_tasks").Insert(task, false, "", "", "").Execute()
		if err != nil {
			fmt.Printf("Error creating task: %v\n", err)
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		// Parse the response to get the created task
		var createdTasks []Task
		if err := json.Unmarshal(data, &createdTasks); err != nil {
			fmt.Printf("Error unmarshaling task response: %v\n", err)
			http.Error(w, "Error processing task data", http.StatusInternalServerError)
			return
		}

		if len(createdTasks) == 0 {
			http.Error(w, "No task was created", http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(createdTasks[0])
	}).Methods("GET", "POST", "OPTIONS")

	// Update task endpoint
	r.HandleFunc("/api/tasks/{taskId}", func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPut {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
			return
		}

		vars := mux.Vars(r)
		taskId := vars["taskId"]

		var updates map[string]interface{}
		if err := json.NewDecoder(r.Body).Decode(&updates); err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}

		// Validate status if it's being updated
		if status, ok := updates["status"].(string); ok {
			validStatuses := []string{"pending", "in_progress", "completed"}
			valid := false
			for _, validStatus := range validStatuses {
				if status == validStatus {
					valid = true
					break
				}
			}
			if !valid {
				http.Error(w, "Invalid status value", http.StatusBadRequest)
				return
			}
		}

		// Update task in Supabase
		data, _, err := client.From("milestone_tasks").
			Update(updates, "", "").
			Eq("id", taskId).
			Execute()

		if err != nil {
			fmt.Printf("Error updating task: %v\n", err)
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		// Parse the response to get the updated task
		var updatedTask Task
		if err := json.Unmarshal(data, &updatedTask); err != nil {
			fmt.Printf("Error unmarshaling task response: %v\n", err)
			http.Error(w, "Error processing task data", http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(updatedTask)
	}).Methods("PUT", "OPTIONS")

	// Review task endpoint
	r.HandleFunc("/api/tasks/{taskId}/review", func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
			return
		}

		vars := mux.Vars(r)
		taskId := vars["taskId"]

		// Update task review status in Supabase
		updates := map[string]interface{}{
			"reviewed": true,
		}

		data, _, err := client.From("milestone_tasks").
			Update(updates, "", "").
			Eq("id", taskId).
			Execute()

		if err != nil {
			fmt.Printf("Error reviewing task: %v\n", err)
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		// Parse the response to get the updated task
		var updatedTask Task
		if err := json.Unmarshal(data, &updatedTask); err != nil {
			fmt.Printf("Error unmarshaling task response: %v\n", err)
			http.Error(w, "Error processing task data", http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(updatedTask)
	}).Methods("POST", "OPTIONS")

	// Upload task evidence endpoint
	r.HandleFunc("/api/tasks/{taskId}/evidence", func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
			return
		}

		vars := mux.Vars(r)
		taskId := vars["taskId"]

		// Parse multipart form
		if err := r.ParseMultipartForm(10 << 20); err != nil { // 10 MB max
			http.Error(w, "Error parsing form", http.StatusBadRequest)
			return
		}

		file, handler, err := r.FormFile("file")
		if err != nil {
			http.Error(w, "Error retrieving file", http.StatusBadRequest)
			return
		}
		defer file.Close()

		// Create uploads directory if it doesn't exist
		uploadDir := "./uploads"
		if err := os.MkdirAll(uploadDir, 0755); err != nil {
			http.Error(w, "Error creating upload directory", http.StatusInternalServerError)
			return
		}

		// Create unique filename
		filename := fmt.Sprintf("%s_%s", taskId, handler.Filename)
		filepath := filepath.Join(uploadDir, filename)

		// Create the file
		dst, err := os.Create(filepath)
		if err != nil {
			http.Error(w, "Error creating file", http.StatusInternalServerError)
			return
		}
		defer dst.Close()

		// Copy the uploaded file to the destination file
		if _, err := io.Copy(dst, file); err != nil {
			http.Error(w, "Error saving file", http.StatusInternalServerError)
			return
		}

		// Generate URL for the uploaded file
		evidenceUrl := fmt.Sprintf("/uploads/%s", filename)

		// Update task with evidence URL in Supabase
		updates := map[string]interface{}{
			"evidence": evidenceUrl,
		}

		data, _, err := client.From("tasks").
			Update(updates, "", "").
			Eq("id", taskId).
			Execute()

		if err != nil {
			fmt.Printf("Error updating task evidence: %v\n", err)
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		// Parse the response to get the updated task
		var updatedTask Task
		if err := json.Unmarshal(data, &updatedTask); err != nil {
			fmt.Printf("Error unmarshaling task response: %v\n", err)
			http.Error(w, "Error processing task data", http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]string{
			"evidenceUrl": evidenceUrl,
		})
	}).Methods("POST", "OPTIONS")

	fmt.Println("Server starting on :8080")
	http.ListenAndServe(":8080", r)
}
