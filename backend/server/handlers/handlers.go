package handlers

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"

	"github.com/gorilla/mux"
	"github.com/supabase-community/supabase-go"
)

// CORS middleware
func CORSMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "https://www.imarahub.xyz")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
		w.Header().Set("Access-Control-Allow-Credentials", "true")

		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}
		next.ServeHTTP(w, r)
	})
}

// Types

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
	Tasks       []Task `json:"milestone_tasks"`
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

// TimelineHandler handles POST /api/timeline
func TimelineHandler(client *supabase.Client) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
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

		timelineData := map[string]interface{}{
			"project_id":  timeline.ProjectID,
			"start_date":  timeline.StartDate,
			"end_date":    timeline.EndDate,
			"description": timeline.Description,
		}

		_, response, err := client.From("project_timelines").Insert(timelineData, false, "", "", "").Execute()
		if err != nil {
			fmt.Printf("Error inserting timeline into Supabase: %v\n", err)
			http.Error(w, fmt.Sprintf("Database error: %v", err), http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(response)
	}
}

// GetMilestonesHandler handles GET /api/projects/{projectId}/milestones
func GetMilestonesHandler(client *supabase.Client) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodGet {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
			return
		}

		vars := mux.Vars(r)
		projectId := vars["projectId"]

		data, _, err := client.From("milestones").
			Select(`*,milestone_tasks (id,title,description,assignee_id,due_date,status,reviewed,created_by,created_at,updated_at)`, "", false).
			Eq("project_id", projectId).
			Execute()
		if err != nil {
			fmt.Printf("Error fetching milestones: %v\n", err)
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		var milestones []Milestone
		if err := json.Unmarshal(data, &milestones); err != nil {
			fmt.Printf("Error unmarshaling milestones: %v\n", err)
			http.Error(w, "Error processing milestones data", http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(milestones)
	}
}

// CreateMilestoneHandler handles POST /api/milestones
func CreateMilestoneHandler(client *supabase.Client) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
			return
		}

		var milestoneReq CreateMilestoneRequest
		if err := json.NewDecoder(r.Body).Decode(&milestoneReq); err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}

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

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(milestone)
	}
}

// GetProjectTimelineHandler handles GET /api/projects/{projectId}/timeline
func GetProjectTimelineHandler(client *supabase.Client) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodGet {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
			return
		}

		vars := mux.Vars(r)
		projectId := vars["projectId"]

		data, _, err := client.From("project_timelines").
			Select("*", "", false).
			Eq("project_id", projectId).
			Execute()
		if err != nil {
			fmt.Printf("Error fetching timeline: %v\n", err)
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		fmt.Printf("Project ID: %s\n", projectId)
		fmt.Printf("Raw timeline data: %s\n", string(data))

		var timelineData []Timeline
		if err := json.Unmarshal(data, &timelineData); err != nil {
			fmt.Printf("Error unmarshaling timeline data: %v\n", err)
			http.Error(w, "Error processing timeline data", http.StatusInternalServerError)
			return
		}

		if len(timelineData) == 0 {
			w.Header().Set("Content-Type", "application/json")
			json.NewEncoder(w).Encode(map[string]interface{}{})
			return
		}

		responseData := map[string]interface{}{
			"start_date":  timelineData[0].StartDate,
			"end_date":    timelineData[0].EndDate,
			"description": timelineData[0].Description,
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(responseData)
	}
}

// UpdateTimelineHandler handles PUT /api/timeline/{id}
func UpdateTimelineHandler(client *supabase.Client) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
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
	}
}

// TaskHandler handles GET/POST /api/milestones/{milestoneId}/tasks
func TaskHandler(client *supabase.Client) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		vars := mux.Vars(r)
		milestoneId := vars["milestoneId"]

		if r.Method == http.MethodGet {
			data, _, err := client.From("milestone_tasks").
				Select("*", "", false).
				Eq("milestone_id", milestoneId).
				Execute()
			if err != nil {
				fmt.Printf("Error fetching tasks: %v\n", err)
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}

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
	}
}

// UpdateTaskHandler handles PUT /api/tasks/{taskId}
func UpdateTaskHandler(client *supabase.Client) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPut {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
			return
		}

		vars := mux.Vars(r)
		taskId := vars["taskId"]

		var updates map[string]interface{}
		if err := json.NewDecoder(r.Body).Decode(&updates); err != nil {
			fmt.Printf("Error decoding task updates: %v\n", err)
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}

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

		data, _, err := client.From("milestone_tasks").
			Update(updates, "", "").
			Eq("id", taskId).
			Execute()
		if err != nil {
			fmt.Printf("Error updating task: %v\n", err)
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		var updatedTasks []Task
		if err := json.Unmarshal(data, &updatedTasks); err != nil {
			fmt.Printf("Error unmarshaling task response: %v\n", err)
			http.Error(w, "Error processing task data", http.StatusInternalServerError)
			return
		}

		if len(updatedTasks) == 0 {
			http.Error(w, "Task not found", http.StatusNotFound)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(updatedTasks[0])
	}
}

// ReviewTaskHandler handles POST /api/tasks/{taskId}/review
func ReviewTaskHandler(client *supabase.Client) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
			return
		}

		vars := mux.Vars(r)
		taskId := vars["taskId"]

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

		var updatedTask Task
		if err := json.Unmarshal(data, &updatedTask); err != nil {
			fmt.Printf("Error unmarshaling task response: %v\n", err)
			http.Error(w, "Error processing task data", http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(updatedTask)
	}
}

// UploadTaskEvidenceHandler handles POST /api/tasks/{taskId}/evidence
func UploadTaskEvidenceHandler(client *supabase.Client) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
			return
		}

		vars := mux.Vars(r)
		taskId := vars["taskId"]

		if err := r.ParseMultipartForm(10 << 20); err != nil {
			http.Error(w, "Error parsing form", http.StatusBadRequest)
			return
		}

		file, handler, err := r.FormFile("file")
		if err != nil {
			http.Error(w, "Error retrieving file", http.StatusBadRequest)
			return
		}
		defer file.Close()

		uploadDir := "./uploads"
		if err := os.MkdirAll(uploadDir, 0o755); err != nil {
			http.Error(w, "Error creating upload directory", http.StatusInternalServerError)
			return
		}

		filename := fmt.Sprintf("%s_%s", taskId, handler.Filename)
		filepath := filepath.Join(uploadDir, filename)

		dst, err := os.Create(filepath)
		if err != nil {
			http.Error(w, "Error creating file", http.StatusInternalServerError)
			return
		}
		defer dst.Close()

		if _, err := io.Copy(dst, file); err != nil {
			http.Error(w, "Error saving file", http.StatusInternalServerError)
			return
		}

		evidenceUrl := fmt.Sprintf("/uploads/%s", filename)

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
	}
}
