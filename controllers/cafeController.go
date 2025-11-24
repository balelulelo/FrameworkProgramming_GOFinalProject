package controllers

import (
	"net/http"
	"strings" 
	"strconv" 

	"github.com/gin-gonic/gin"
	"github.com/rizqy/cafetify/initializers"
	"github.com/rizqy/cafetify/models"
)

// CREATE CAFE (Dibuat Sebelumnya)
func CreateCafe(c *gin.Context) {
	// ... (Kode CreateCafe sama seperti sebelumnya)
	var body struct {
		Name      string
		Address   string
		Latitude  float64
		Longitude float64
	}

	if c.Bind(&body) != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Gagal membaca input data"})
		return
	}

	cafe := models.Cafe{
		Name:      body.Name,
		Address:   body.Address,
		Latitude:  body.Latitude,
		Longitude: body.Longitude,
	}

	result := initializers.DB.Create(&cafe)

	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menyimpan kafe"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Kafe berhasil ditambahkan! Silakan beri rating.",
		"cafe":    cafe,
	})
}


// RATE CAFE (Dibuat Sebelumnya)
func RateCafe(c *gin.Context) {
	// 1. Ambil ID Kafe dari URL dan ID User dari Context
	cafeIDStr := c.Param("id")
	cafeID, err := strconv.ParseUint(cafeIDStr, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID Kafe tidak valid"})
		return
	}

	// Ambil data user dari middleware (RequireAuth)
	user, exists := c.Get("user")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized: User ID tidak ditemukan di context"})
		return
	}
	userID := user.(models.User).ID

	// 2. Tangkap Input Rating dan Tags
	var body struct {
		AmbienceRating int    `json:"ambience_rating" binding:"required"`
		ServiceRating  int    `json:"service_rating" binding:"required"`
		PriceLevel     string `json:"price_level" binding:"required"`
		MenuVariety    string `json:"menu_variety" binding:"required"`
		Notes          string `json:"notes"`
		TagsInput      string `json:"tags_input"` // Tags dalam bentuk string dipisahkan koma
	}

	if c.BindJSON(&body) != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Gagal membaca input rating"})
		return
	}

	// 3. Simpan Personal Rating ke Database (Relasi 1:N)
	personalRating := models.PersonalRating{
		UserID:         userID,
		CafeID:         uint(cafeID),
		AmbienceRating: body.AmbienceRating,
		ServiceRating:  body.ServiceRating,
		PriceLevel:     body.PriceLevel,
		MenuVariety:    body.MenuVariety,
		Notes:          body.Notes,
	}

	if result := initializers.DB.Create(&personalRating); result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menyimpan rating: " + result.Error.Error()})
		return
	}

	// 4. Proses Tags (Relasi N:M)
	if body.TagsInput != "" {
		tagNames := strings.Split(body.TagsInput, ",")
		var attachedTags []models.Tag

		for _, name := range tagNames {
			tagName := strings.TrimSpace(name)
			if tagName == "" {
				continue
			}

			var tag models.Tag
			initializers.DB.FirstOrCreate(&tag, models.Tag{Name: tagName})
			attachedTags = append(attachedTags, tag)
		}

		var cafe models.Cafe
		initializers.DB.First(&cafe, cafeID)
		
		// GORM Association: Hubungkan Kafe dengan Tag (Menyimpan ke tabel cafe_tags)
		initializers.DB.Model(&cafe).Association("Tags").Replace(attachedTags)
	}


	c.JSON(http.StatusOK, gin.H{
		"message": "Rating dan Tag berhasil disimpan!",
		"rating":  personalRating,
	})
}

// GET ALL CAFES (Dibuat Sebelumnya & sudah menggunakan Preload)
func GetAllCafes(c *gin.Context) {
	var cafes []models.Cafe
	
	result := initializers.DB.Preload("Ratings").Preload("Tags").Find(&cafes)

	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengambil data kafe"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"cafes": cafes,
	})
}


// UPDATE CAFE (FITUR BARU: U)
func UpdateCafe(c *gin.Context) {
	// 1. Ambil ID Kafe dari URL
	cafeID := c.Param("id")
	
	// 2. Tangkap Input yang akan diupdate
	var body struct {
		Name    string
		Address string
	}

	if c.Bind(&body) != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Gagal membaca input data"})
		return
	}
	
	// 3. Cari kafe yang mau diupdate
	var cafe models.Cafe
	if result := initializers.DB.First(&cafe, cafeID); result.Error != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Kafe tidak ditemukan"})
		return
	}
	
	// 4. Update data kafe
	initializers.DB.Model(&cafe).Updates(models.Cafe{
		Name:    body.Name,
		Address: body.Address,
		// Kita hanya update Nama dan Alamat di sini.
	})

	c.JSON(http.StatusOK, gin.H{
		"message": "Kafe berhasil diperbarui!",
		"cafe":    cafe,
	})
}

// DELETE CAFE (FITUR BARU: D - Soft Delete)
func DeleteCafe(c *gin.Context) {
	// 1. Ambil ID Kafe dari URL
	cafeID := c.Param("id")
	
	// 2. Lakukan Soft Delete (GORM mengisi kolom deleted_at)
	// Catatan: Ini tidak menghapus data secara fisik, hanya menyembunyikannya dari query normal
	result := initializers.DB.Delete(&models.Cafe{}, cafeID)
	
	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menghapus kafe: " + result.Error.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Kafe berhasil dihapus (Soft Deleted)"})
}