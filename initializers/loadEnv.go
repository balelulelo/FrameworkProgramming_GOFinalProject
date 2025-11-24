package initializers

import (
	"log"
	"github.com/joho/godotenv"
)

func LoadEnvVariables() {
	// Mencari file .env dan memuat isinya ke memori komputer
	err := godotenv.Load()
	if err != nil {
		log.Fatal("Error loading .env file")
	}
}