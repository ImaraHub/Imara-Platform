package main

import (
	"fmt"
	"os"

	"github.com/joho/godotenv"
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
		fmt.Println("cannot initalize client", err)
	}

	// Example: Fetch data from a table
	_, response, err := client.From("users").Select("*", "", false).Execute()
	if err != nil {
		fmt.Println("Error fetching data:", err)
		return
	}

	fmt.Println("Response:", response)

	// convert the  byte to character?
	

}
