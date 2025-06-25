package main

import (
	"io"
	"net/http"
	"os"
	"strings"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/ledongthuc/pdf"
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

func main() {
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
	r.Run(":8000")
}
