package handlers

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io/ioutil"
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
			"userAddress":  os.Getenv("SWYPT_USER_ADDRESS"),
			"tokenAddress": os.Getenv("SWYPT_USDT_TOKEN_ADDRESS"),
		}
		payloadBytes, _ := json.Marshal(payload)
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
		body, _ := ioutil.ReadAll(resp.Body)
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
		body, _ := ioutil.ReadAll(resp.Body)
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
