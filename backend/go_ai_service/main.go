package main

import (
	"encoding/json"
	"fmt"
	"io"
	"io/ioutil"
	"net/http"
	"os"
	"regexp"
	"strings"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/ledongthuc/pdf"
	"github.com/joho/godotenv"
	bytes2 "bytes"
)

func extractTextFromPDF(path string) (string, error) {
	f, r, err := pdf.Open(path)
	if err != nil {
		return "", err
	}
	defer f.Close()
	var textBuilder strings.Builder
	b, err := r.GetPlainText()
	if err != nil {
		return "", err
	}
	_, err = io.Copy(&textBuilder, b)
	return textBuilder.String(), err
}

func verifyCV(cvText, role string) (bool, []string, []string) {
	// Example: simple keyword matching for demonstration
	roleSkills := map[string][]string{
		"Frontend Developer": {"react", "javascript", "css", "html"},
		"Backend Developer":  {"node", "express", "django", "flask", "api", "database"},
		"UI/UX Designer":     {"figma", "adobe", "sketch", "wireframe", "prototype"},
	}
	required, ok := roleSkills[role]
	if !ok {
		return false, nil, nil
	}
	cvTextLower := strings.ToLower(cvText)
	var found, missing []string
	for _, skill := range required {
		if strings.Contains(cvTextLower, skill) {
			found = append(found, skill)
		} else {
			missing = append(missing, skill)
		}
	}
	return len(missing) == 0, found, missing
}

// Helper to extract GitHub username from URL or plain username
func extractGitHubUsername(input string) string {
	// If input is a URL, extract username
	re := regexp.MustCompile(`github.com/([^/]+)`)
	matches := re.FindStringSubmatch(input)
	if len(matches) > 1 {
		return matches[1]
	}
	return input // assume it's already a username
}

// Fetch public repos and languages for a GitHub user
func fetchGitHubData(username string) (map[string]interface{}, error) {
	reposURL := fmt.Sprintf("https://api.github.com/users/%s/repos", username)
	githubToken := os.Getenv("GITHUB_TOKEN")

	client := &http.Client{}
	req, err := http.NewRequest("GET", reposURL, nil)
	if err != nil {
		return nil, err
	}
	if githubToken != "" {
		req.Header.Set("Authorization", "token "+githubToken)
	}
	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()
	if resp.StatusCode != 200 {
		return nil, fmt.Errorf("GitHub API error: %s", resp.Status)
	}
	var repos []map[string]interface{}
	if err := json.NewDecoder(resp.Body).Decode(&repos); err != nil {
		return nil, err
	}
	summary := map[string]interface{}{
		"repo_count": len(repos),
		"repos":     []map[string]interface{}{},
	}
	for _, repo := range repos {
		name, _ := repo["name"].(string)
		langURL, _ := repo["languages_url"].(string)
		// Fetch languages for each repo
		langReq, err := http.NewRequest("GET", langURL, nil)
		if err != nil {
			continue
		}
		if githubToken != "" {
			langReq.Header.Set("Authorization", "token "+githubToken)
		}
		langsResp, err := client.Do(langReq)
		if err != nil {
			continue
		}
		langsBody, _ := ioutil.ReadAll(langsResp.Body)
		langsResp.Body.Close()
		var langs map[string]int
		json.Unmarshal(langsBody, &langs)
		summary["repos"] = append(summary["repos"].([]map[string]interface{}), map[string]interface{}{
			"name":     name,
			"languages": langs,
		})
	}
	fmt.Println("Loaded GITHUB_TOKEN:", githubToken)
	return summary, nil
}

func callGroqLLM(apiKey, role string, githubSummary map[string]interface{}) (bool, string, error) {
	groqURL := "https://api.groq.com/openai/v1/chat/completions"
	prompt := fmt.Sprintf(`Given the following GitHub summary and the role "%s", does the user have relevant contributions for this role? Respond ONLY with a valid JSON object in this format: {\"qualified\": true/false, \"message\": \"short explanation\"}. Do not include any other text, markdown, or explanation.\n\nGitHub summary: %v`, role, githubSummary)

	requestBody := map[string]interface{}{
		"model": "llama3-8b-8192",
		"messages": []map[string]string{
			{"role": "system", "content": "You are an expert technical recruiter."},
			{"role": "user", "content": prompt},
		},
	}
	jsonBody, _ := json.Marshal(requestBody)

	req, err := http.NewRequest("POST", groqURL, bytes2.NewBuffer(jsonBody))
	if err != nil {
		return false, "", err
	}
	req.Header.Set("Authorization", "Bearer "+apiKey)
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return false, "", err
	}
	defer resp.Body.Close()
	if resp.StatusCode != 200 {
		body, _ := ioutil.ReadAll(resp.Body)
		return false, "", fmt.Errorf("Groq API error: %s - %s", resp.Status, string(body))
	}
	var groqResp struct {
		Choices []struct {
			Message struct {
				Content string `json:"content"`
			} `json:"message"`
		} `json:"choices"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&groqResp); err != nil {
		return false, "", err
	}
	if len(groqResp.Choices) == 0 {
		return false, "", fmt.Errorf("No response from Groq LLM")
	}
	// Extract the first {...} JSON object from the LLM's content
	content := groqResp.Choices[0].Message.Content
	fmt.Println("Raw LLM response content:\n", content)
	re := regexp.MustCompile(`(?s)\{.*?\}`)
	jsonMatch := re.FindString(content)
	if jsonMatch == "" {
		return false, "", fmt.Errorf("No JSON object found in LLM response: %s", content)
	}
	// Parse the JSON from the extracted object
	var result struct {
		Qualified bool   `json:"qualified"`
		Message   string `json:"message"`
	}

	// If the JSON contains lots of backslashes, unescape it first
	if strings.Contains(jsonMatch, "\\\"") {
		// Wrap in quotes if not already
		unescaped := jsonMatch
		if !(len(unescaped) > 0 && unescaped[0] == '"') {
			unescaped = "\"" + unescaped + "\""
		}
		var tmp string
		err = json.Unmarshal([]byte(unescaped), &tmp)
		if err != nil {
			return false, "", fmt.Errorf("Failed to unescape LLM response: %v. Raw: %s", err, jsonMatch)
		}
		err = json.Unmarshal([]byte(tmp), &result)
		if err != nil {
			return false, "", fmt.Errorf("Failed to parse unescaped LLM response: %v. Raw: %s", err, tmp)
		}
	} else {
		err = json.Unmarshal([]byte(jsonMatch), &result)
		if err != nil {
			return false, "", fmt.Errorf("Failed to parse LLM response: %v. Raw: %s", err, jsonMatch)
		}
	}
	return result.Qualified, result.Message, nil
}

func main() {
	// Load .env file
	_ = godotenv.Load()
	groqApiKey := os.Getenv("GROQ_API_KEY")
	if groqApiKey == "" {
		fmt.Println("Warning: GROQ_API_KEY not set in environment")
	}

	r := gin.Default()
	r.Use(cors.Default())

	r.POST("/verify", func(c *gin.Context) {
		role := c.PostForm("role")
		file, err := c.FormFile("cv")
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "CV file required"})
			return
		}
		tempPath := "./" + file.Filename
		if err := c.SaveUploadedFile(file, tempPath); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save file"})
			return
		}
		defer os.Remove(tempPath)
		cvText, err := extractTextFromPDF(tempPath)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to extract text from PDF"})
			return
		}
		qualified, found, missing := verifyCV(cvText, role)
		c.JSON(http.StatusOK, gin.H{
			"qualified":            qualified,
			"found_technologies":   found,
			"missing_technologies": missing,
		})
	})

	r.POST("/verify-github", func(c *gin.Context) {
		var req struct {
			Role   string `json:"role"`
			GitHub string `json:"github"`
		}
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
			return
		}
		username := extractGitHubUsername(req.GitHub)
		data, err := fetchGitHubData(username)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		groqApiKey := os.Getenv("GROQ_API_KEY")
		qualified, message, err := callGroqLLM(groqApiKey, req.Role, data)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error(), "github_summary": data})
			return
		}
		c.JSON(http.StatusOK, gin.H{
			"role": req.Role,
			"github": username,
			"qualified": qualified,
			"message": message,
			"github_summary": data,
		})
	})

	r.Run(":8000")
}
