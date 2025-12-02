package initializers

import (
	"log"
	"os"

	"gorm.io/driver/mysql"
	"gorm.io/gorm"
)

// Global variable 'DB' so it can be accessed by any controller later
var DB *gorm.DB

func ConnectToDB() {
	var err error
	// get connection string from .env file
	dsn := os.Getenv("DB_URL")

	// Open connection to MySQL using GORM
	DB, err = gorm.Open(mysql.Open(dsn), &gorm.Config{})

	// Error Checking: If connection fails, terminate the application (Panic)
	if err != nil {
		log.Fatal("Failed to connect to Database! Check if XAMPP is on and DB name is correct .")
	}
}
