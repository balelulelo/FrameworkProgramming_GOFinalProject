package main

import (
	"time"

	"github.com/gin-contrib/cors" // di terminal run dulu "go get github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/rizqy/cafetify/controllers"
	"github.com/rizqy/cafetify/initializers"
	"github.com/rizqy/cafetify/middleware"
	"github.com/rizqy/cafetify/models"
)

func init() {
	initializers.LoadEnvVariables()
	initializers.ConnectToDB()
	initializers.DB.AutoMigrate(&models.User{}, &models.Cafe{}, &models.PersonalRating{}, &models.Tag{})
}

func main() {
	r := gin.Default()

	// --- TAMBAHAN PENTING: CONFIG CORS ---
	// Agar React (localhost:5173) boleh ngomong sama Go (localhost:8080)
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:5173"}, // sesuain sm port React kamu
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true, // harus true biar cookie bisa dikirim
		MaxAge:           12 * time.Hour,
	}))
	// --------------------------------------

	// route public

	r.GET("/ping", func(c *gin.Context) {
		c.JSON(200, gin.H{"message": "Pong! Cafetify Backend Ready!"})
	})

	r.POST("/register", controllers.Register)
	r.POST("/login", controllers.Login)
	r.GET("/cafes", controllers.GetAllCafes)

	// ---------- route protected

	protected := r.Group("/protected")
	protected.Use(middleware.RequireAuth)
	{
		//route for cafe
		protected.POST("/cafes", controllers.CreateCafe)
		protected.GET("/cafes", controllers.GetAllCafes)
		protected.PUT("/cafes/:id", controllers.UpdateCafe)
		protected.DELETE("/cafes/:id", controllers.DeleteCafe)
		protected.POST("/cafes/:id/rate", controllers.RateCafe)

		// route for profile
		protected.GET("/profile", controllers.GetProfile)
		protected.PUT("/profile", controllers.UpdateProfile)
		protected.PUT("/change-password", controllers.ChangePassword)
	}

	r.Run()
}
