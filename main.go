package main

import (
	"github.com/gin-gonic/gin"
	// Pastikan nama module 'github.com/rizqy/cafetify' sesuai dengan go.mod Anda
	"github.com/rizqy/cafetify/controllers" 
	"github.com/rizqy/cafetify/initializers"
	"github.com/rizqy/cafetify/middleware" 
	"github.com/rizqy/cafetify/models"
)

// Fungsi init() dijalankan OTOMATIS sebelum main()
func init() {
	initializers.LoadEnvVariables()
	initializers.ConnectToDB()
	
	// AUTO MIGRATE: Membangun 5 tabel Cafetify di database
	// Ini adalah baris yang memastikan relasi dan tabel dibuat di MySQL
	initializers.DB.AutoMigrate(
		&models.User{},
		&models.Cafe{},
		&models.PersonalRating{},
		&models.Tag{},
	)
}

func main() {
	// Menyiapkan router GIN
	r := gin.Default()

	// ---------------------------------
	// 1. PUBLIC ROUTES (Tanpa Login)
	// ---------------------------------
	r.GET("/ping", func(c *gin.Context) {
		c.JSON(200, gin.H{"message": "Pong! Cafetify Backend & Database Ready!"})
	})
	
	r.POST("/register", controllers.Register) 
	r.POST("/login", controllers.Login)       
	
	// GET /cafes: Mengambil semua kafe dengan data Ratings dan Tags (menggunakan Preload)
	r.GET("/cafes", controllers.GetAllCafes) 

	// ---------------------------------
	// 2. PROTECTED ROUTES (Wajib Login)
	// ---------------------------------
	// Semua rute di dalam grup ini akan dicek oleh middleware.RequireAuth (Satpam)
	protected := r.Group("/protected")
	protected.Use(middleware.RequireAuth) 
	{
		// CREATE: Membuat data kafe faktual
		protected.POST("/cafe", controllers.CreateCafe)
		
		// CREATE RELASIONAL: Membuat Rating, Notes, dan Tags baru untuk kafe
		protected.POST("/cafe/:id/rate", controllers.RateCafe)
		
		// UPDATE: Memperbarui Nama atau Alamat Kafe
		protected.PUT("/cafe/:id", controllers.UpdateCafe)
		
		// DELETE: Menghapus Kafe (Soft Delete)
		protected.DELETE("/cafe/:id", controllers.DeleteCafe)
	}

	// Menjalankan server di port 8080
	r.Run()
}