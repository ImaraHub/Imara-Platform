package handlers

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/gorilla/mux"
)

// Helper to get Swypt API headers
func getSwyptHeaders() map[string]string {
	return map[string]string{
		"x-api-key":    os.Getenv("SWYPT_API_KEY"),
		"x-api-secret": os.Getenv("SWYPT_API_SECRET"),
	}
}

// POST /api/mpesa/initiate
func InitiateMpesaPaymentHandler() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		type Req struct {
			PhoneNumber string `json:"phoneNumber"`
			Amount      int    `json:"amount"`
		}
		type Resp struct {
			Success bool   `json:"success"`
			OrderID string `json:"orderID,omitempty"`
			Message string `json:"message"`
		}
		var req Req
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, "Invalid request body", http.StatusBadRequest)
			return
		}
		formattedPhone := req.PhoneNumber
		if len(formattedPhone) == 10 && formattedPhone[0] == '0' {
			formattedPhone = "254" + formattedPhone[1:]
		}
		payload := map[string]interface{}{
			"partyA":       formattedPhone,
			"amount":       fmt.Sprintf("%d", req.Amount),
			"side":         "onramp",
			"userAddress":  os.Getenv("DEPOSIT_ADDRESS"),
			"tokenAddress": os.Getenv("SWYPT_USDT_TOKEN_ADDRESS"),
		}
		payloadBytes, err := json.Marshal(payload)
		if err != nil {
			log.Println("Failed to marshal payload:", err)
			http.Error(w, "Failed to process request", http.StatusInternalServerError)
			return
		}
		apiUrl := os.Getenv("SWYPT_API_URL") + "/swypt-onramp"
		client := &http.Client{Timeout: 10 * time.Second}
		reqHttp, _ := http.NewRequest("POST", apiUrl, bytes.NewBuffer(payloadBytes))
		for k, v := range getSwyptHeaders() {
			reqHttp.Header.Set(k, v)
		}
		reqHttp.Header.Set("Content-Type", "application/json")
		resp, err := client.Do(reqHttp)
		if err != nil {
			log.Println("Swypt API error:", err)
			http.Error(w, "Failed to initiate M-Pesa payment", http.StatusInternalServerError)
			return
		}
		defer resp.Body.Close()
		body, err := io.ReadAll(resp.Body)
		if err != nil {
			log.Println("Failed to read response body:", err)
			http.Error(w, "Failed to read response body", http.StatusInternalServerError)
			return
		}
		fmt.Println(resp)
		var swyptResp map[string]interface{}
		json.Unmarshal(body, &swyptResp)
		if swyptResp["status"] == "success" {
			data := swyptResp["data"].(map[string]interface{})
			json.NewEncoder(w).Encode(Resp{
				Success: true,
				OrderID: data["orderID"].(string),
				Message: data["message"].(string),
			})
			return
		}
		msg := swyptResp["message"]
		if msg == nil {
			msg = "Failed to initiate M-Pesa payment"
		}
		json.NewEncoder(w).Encode(Resp{Success: false, Message: msg.(string)})
	}
}

// GET /api/mpesa/status/{orderID}
func PollPaymentStatusHandler() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		orderID := mux.Vars(r)["orderID"]
		type Resp struct {
			Success bool        `json:"success"`
			Status  interface{} `json:"status"`
			Message string      `json:"message"`
		}
		apiUrl := os.Getenv("SWYPT_API_URL") + "/order-onramp-status/" + orderID
		client := &http.Client{Timeout: 10 * time.Second}
		reqHttp, _ := http.NewRequest("GET", apiUrl, nil)
		for k, v := range getSwyptHeaders() {
			reqHttp.Header.Set(k, v)
		}
		resp, err := client.Do(reqHttp)
		if err != nil {
			http.Error(w, "Failed to check payment status", http.StatusInternalServerError)
			return
		}
		defer resp.Body.Close()
		body, _ := io.ReadAll(resp.Body)
		var swyptResp map[string]interface{}
		json.Unmarshal(body, &swyptResp)
		if swyptResp["status"] == "success" {
			json.NewEncoder(w).Encode(Resp{
				Success: true,
				Status:  swyptResp["data"],
				Message: swyptResp["data"].(map[string]interface{})["message"].(string),
			})
			return
		}
		msg := swyptResp["message"]
		if msg == nil {
			msg = "Failed to check payment status"
		}
		json.NewEncoder(w).Encode(Resp{Success: false, Message: msg.(string)})
	}
}

// POST /api/swypt/crypto-transfer
func ProcessCryptoTransferHandler() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		type Req struct {
			OrderID string `json:"orderID"`
		}
		type Resp struct {
			Success bool   `json:"success"`
			Hash    string `json:"hash,omitempty"`
			Message string `json:"message"`
			Status  string `json:"status,omitempty"`
		}
		var req Req
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, "Invalid request body", http.StatusBadRequest)
			return
		}
		payload := map[string]interface{}{
			"chain":   "lisk",
			"address": os.Getenv("DEPOSIT_ADDRESS"),
			"orderID": req.OrderID,
			"project": "imara",
		}
		payloadBytes, _ := json.Marshal(payload)
		apiUrl := os.Getenv("SWYPT_API_URL") + "/swypt-deposit"
		client := &http.Client{Timeout: 10 * time.Second}
		reqHttp, _ := http.NewRequest("POST", apiUrl, bytes.NewBuffer(payloadBytes))
		for k, v := range getSwyptHeaders() {
			reqHttp.Header.Set(k, v)
		}
		reqHttp.Header.Set("Content-Type", "application/json")
		resp, err := client.Do(reqHttp)
		if err != nil {
			log.Println("Swypt API error:", err)
			http.Error(w, "Failed to process crypto transfer", http.StatusInternalServerError)
			return
		}
		defer resp.Body.Close()
		body, err := io.ReadAll(resp.Body)
		if err != nil {
			log.Println("Failed to read response body:", err)
			http.Error(w, "Failed to read response body", http.StatusInternalServerError)
			return
		}
		var swyptResp map[string]interface{}
		json.Unmarshal(body, &swyptResp)
		if status, ok := swyptResp["status"].(float64); ok && int(status) == 200 {
			json.NewEncoder(w).Encode(Resp{
				Success: true,
				Hash:    swyptResp["hash"].(string),
				Message: swyptResp["message"].(string),
				Status:  "success",
			})
			return
		}
		msg := swyptResp["message"]
		if msg == nil {
			msg = "Failed to process crypto transfer"
		}
		json.NewEncoder(w).Encode(Resp{Success: false, Message: msg.(string)})
	}
}

// POST /api/swypt/quotes
func GetSwyptQuoteHandler() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		type Req struct {
			Type           string `json:"type"`
			Amount         string `json:"amount"`
			FiatCurrency   string `json:"fiatCurrency"`
			CryptoCurrency string `json:"cryptoCurrency"`
			Network        string `json:"network"`
		}
		var req Req
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, "Invalid request body", http.StatusBadRequest)
			return
		}
		payload := map[string]interface{}{
			"type":           req.Type,
			"amount":         req.Amount,
			"fiatCurrency":   req.FiatCurrency,
			"cryptoCurrency": req.CryptoCurrency,
			"network":        req.Network,
		}
		payloadBytes, _ := json.Marshal(payload)
		apiUrl := os.Getenv("SWYPT_API_URL") + "/swypt-quotes"
		client := &http.Client{Timeout: 10 * time.Second}
		reqHttp, _ := http.NewRequest("POST", apiUrl, bytes.NewBuffer(payloadBytes))
		for k, v := range getSwyptHeaders() {
			reqHttp.Header.Set(k, v)
		}
		reqHttp.Header.Set("Content-Type", "application/json")
		resp, err := client.Do(reqHttp)
		if err != nil {
			log.Println("Swypt API error:", err)
			http.Error(w, "Failed to get quote", http.StatusInternalServerError)
			return
		}
		defer resp.Body.Close()
		body, err := io.ReadAll(resp.Body)
		if err != nil {
			log.Println("Failed to read response body:", err)
			http.Error(w, "Failed to read response body", http.StatusInternalServerError)
			return
		}
		w.Header().Set("Content-Type", "application/json")
		w.Write(body)
	}
}

// GET /api/swypt/supported-assets
func GetSwyptSupportedAssetsHandler() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		apiUrl := os.Getenv("SWYPT_API_URL") + "/swypt-supported-assets"
		client := &http.Client{Timeout: 10 * time.Second}
		reqHttp, _ := http.NewRequest("GET", apiUrl, nil)
		for k, v := range getSwyptHeaders() {
			reqHttp.Header.Set(k, v)
		}
		resp, err := client.Do(reqHttp)
		if err != nil {
			log.Println("Swypt API error:", err)
			http.Error(w, "Failed to get supported assets", http.StatusInternalServerError)
			return
		}
		defer resp.Body.Close()
		body, err := io.ReadAll(resp.Body)
		if err != nil {
			log.Println("Failed to read response body:", err)
			http.Error(w, "Failed to read response body", http.StatusInternalServerError)
			return
		}
		w.Header().Set("Content-Type", "application/json")
		w.Write(body)
	}
}

// POST /api/swypt/offramp
func SwyptOfframpHandler() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		type Req struct {
			Amount         string `json:"amount"`
			FiatCurrency   string `json:"fiatCurrency"`
			CryptoCurrency string `json:"cryptoCurrency"`
			Network        string `json:"network"`
			Category       string `json:"category"`
		}
		var req Req
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, "Invalid request body", http.StatusBadRequest)
			return
		}
		payload := map[string]interface{}{
			"type":           "offramp",
			"amount":         req.Amount,
			"fiatCurrency":   req.FiatCurrency,
			"cryptoCurrency": req.CryptoCurrency,
			"network":        req.Network,
			"category":       req.Category,
		}
		payloadBytes, _ := json.Marshal(payload)
		apiUrl := os.Getenv("SWYPT_API_URL") + "/swypt-quotes"
		client := &http.Client{Timeout: 10 * time.Second}
		reqHttp, _ := http.NewRequest("POST", apiUrl, bytes.NewBuffer(payloadBytes))
		for k, v := range getSwyptHeaders() {
			reqHttp.Header.Set(k, v)
		}

		
		reqHttp.Header.Set("Content-Type", "application/json")
		resp, err := client.Do(reqHttp)
		if err != nil {
			log.Println("Swypt API error:", err)
			http.Error(w, "Failed to get offramp quote", http.StatusInternalServerError)
			return
		}
		defer resp.Body.Close()

		fmt.Println(resp)
		body, err := io.ReadAll(resp.Body)
		if err != nil {
			log.Println("Failed to read response body:", err)
			http.Error(w, "Failed to read response body", http.StatusInternalServerError)
			return
		}
		w.Header().Set("Content-Type", "application/json")
		w.Write(body)
	}
}
