# go_ai_service

This directory contains a Go-based REST API for verifying builder CVs for project roles.

- Extracts text from PDF CVs
- Matches required skills for each role (rule-based)
- Exposes a /verify endpoint for frontend integration

## Usage

1. Install Go (if not already installed)
2. Install dependencies:
   - `go get github.com/gin-gonic/gin`
   - `go get github.com/ledongthuc/pdf`
   - `go get github.com/gin-contrib/cors`
3. Run the server:
   - `go run main.go`
4. The API will be available at `http://localhost:8000/verify`

## API
- **POST /verify**
  - Form fields: `cv` (PDF file), `role` (string)
  - Returns: `{ qualified: bool, found_technologies: [], missing_technologies: [] }` 