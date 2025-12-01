package controllers

import (
	"net/http"
	"strconv"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/rizqy/cafetify/initializers"
	"github.com/rizqy/cafetify/models"
)

// 1. CREATE CAFE

func CreateCafe(c *gin.Context) {

	var body struct {
		Name      string  `json:"name" binding:"required"`
		Address   string  `json:"address" binding:"required"`
		Latitude  float64 `json:"latitude"`
		Longitude float64 `json:"longitude"`

		AmbienceRating int    `json:"ambience_rating" binding:"required"`
		ServiceRating  int    `json:"service_rating" binding:"required"`
		PriceLevel     string `json:"price_level" binding:"required"`
		MenuVariety    string `json:"menu_variety" binding:"required"`
		Notes          string `json:"notes"`
		TagsInput      string `json:"tags_input"`
	}

	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Input data tidak lengkap: " + err.Error()})
		return
	}

	// get user ID (the one who added the new cafe)
	user, exists := c.Get("user")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}
	userID := user.(models.User).ID

	// --- DATABASE TRANSACTION ---

	tx := initializers.DB.Begin()

	cafe := models.Cafe{
		Name:      body.Name,
		Address:   body.Address,
		Latitude:  body.Latitude,
		Longitude: body.Longitude,
		UserID:    userID, // Save the owner
	}

	if err := tx.Create(&cafe).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menyimpan kafe"})
		return
	}

	// save cafe rating
	rating := models.PersonalRating{
		UserID:         userID,
		CafeID:         cafe.ID, // use the new CAFE id
		AmbienceRating: body.AmbienceRating,
		ServiceRating:  body.ServiceRating,
		PriceLevel:     body.PriceLevel,
		MenuVariety:    body.MenuVariety,
		Notes:          body.Notes,
	}

	if err := tx.Create(&rating).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menyimpan rating"})
		return
	}

	// process tag
	if body.TagsInput != "" {
		tagNames := strings.Split(body.TagsInput, ",")
		var attachedTags []models.Tag

		for _, name := range tagNames {
			tagName := strings.TrimSpace(name)
			if tagName == "" {
				continue
			}

			var tag models.Tag
			// find tag or create new
			if err := tx.FirstOrCreate(&tag, models.Tag{Name: tagName}).Error; err != nil {
				tx.Rollback()
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal memproses tag"})
				return
			}
			attachedTags = append(attachedTags, tag)
		}

		// connect Tag with Kafe
		if err := tx.Model(&cafe).Association("Tags").Replace(attachedTags); err != nil {
			tx.Rollback()
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menyimpan relasi tag"})
			return
		}
	}

	tx.Commit()

	c.JSON(http.StatusOK, gin.H{
		"message": "Kafe berhasil dibuat!",
		"cafe":    cafe,
	})
}

// RATE CAFE

// function only called when user want to rate existing cafe
func RateCafe(c *gin.Context) {
	// id cafe dri URL
	cafeIDStr := c.Param("id")
	cafeID, err := strconv.ParseUint(cafeIDStr, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID Kafe tidak valid"})
		return
	}

	// user data
	user, exists := c.Get("user")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}
	userID := user.(models.User).ID

	// get input rating
	var body struct {
		AmbienceRating int    `json:"ambience_rating" binding:"required"`
		ServiceRating  int    `json:"service_rating" binding:"required"`
		PriceLevel     string `json:"price_level" binding:"required"`
		MenuVariety    string `json:"menu_variety" binding:"required"`
		Notes          string `json:"notes"`
		TagsInput      string `json:"tags_input"`
	}

	if c.BindJSON(&body) != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Gagal membaca input rating"})
		return
	}

	// personal rating
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

	// process tag & update if any new tag appear
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
		initializers.DB.Model(&cafe).Association("Tags").Replace(attachedTags)
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Rating berhasil ditambahkan!",
		"rating":  personalRating,
	})
}

// GET ALL CAFES

func GetAllCafes(c *gin.Context) {
	var cafes []models.Cafe
	tagFilter := c.Query("tag")
	searchQuery := c.Query("search")

	db := initializers.DB.Preload("Ratings").Preload("Tags")

	if tagFilter != "" && tagFilter != "Semua" {
		// Filter by tag name using join
		db = db.Joins("JOIN cafe_tags ON cafe_tags.cafe_id = cafes.id").
			Joins("JOIN tags ON tags.id = cafe_tags.tag_id").
			Where("tags.name = ?", tagFilter)
	}

	if searchQuery != "" {
		db = db.Where("name LIKE ?", "%"+searchQuery+"%")
	}

	result := db.Find(&cafes)

	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengambil data kafe"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"cafes": cafes})
}

//  UPDATE CAFE

func UpdateCafe(c *gin.Context) {
	cafeID := c.Param("id")
	
	// Struct body yang lebih lengkap (sama seperti CreateCafe)
	var body struct {
		Name      string  `json:"name"`
		Address   string  `json:"address"`
		Latitude  float64 `json:"latitude"`
		Longitude float64 `json:"longitude"`

		AmbienceRating int    `json:"ambience_rating"`
		ServiceRating  int    `json:"service_rating"`
		PriceLevel     string `json:"price_level"`
		MenuVariety    string `json:"menu_variety"`
		Notes          string `json:"notes"`
		TagsInput      string `json:"tags_input"`
	}

	if c.BindJSON(&body) != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Gagal membaca input data"})
		return
	}

	var cafe models.Cafe
	if result := initializers.DB.First(&cafe, cafeID); result.Error != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Kafe tidak ditemukan"})
		return
	}

	// Check ownership
	user, _ := c.Get("user")
	userID := user.(models.User).ID

	if cafe.UserID != userID {
		c.JSON(http.StatusForbidden, gin.H{"error": "Anda tidak memiliki izin untuk mengedit kafe ini"})
		return
	}

	// --- DATABASE TRANSACTION ---
	tx := initializers.DB.Begin()

	// 1. Update Cafe Details (Safe Update using Map)
	if err := tx.Model(&cafe).Updates(map[string]interface{}{
		"Name":      body.Name,
		"Address":   body.Address,
		"Latitude":  body.Latitude,
		"Longitude": body.Longitude,
	}).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal update kafe"})
		return
	}

	// 2. Update Personal Rating (Find existing rating by this user for this cafe)
	var rating models.PersonalRating
	if err := tx.Where("user_id = ? AND cafe_id = ?", userID, cafe.ID).First(&rating).Error; err == nil {
		// Rating exists, update it
		tx.Model(&rating).Updates(map[string]interface{}{
			"AmbienceRating": body.AmbienceRating,
			"ServiceRating":  body.ServiceRating,
			"PriceLevel":     body.PriceLevel,
			"MenuVariety":    body.MenuVariety,
			"Notes":          body.Notes,
		})
	} else {
		// Rating doesn't exist (maybe legacy data), create it
		newRating := models.PersonalRating{
			UserID:         userID,
			CafeID:         cafe.ID,
			AmbienceRating: body.AmbienceRating,
			ServiceRating:  body.ServiceRating,
			PriceLevel:     body.PriceLevel,
			MenuVariety:    body.MenuVariety,
			Notes:          body.Notes,
		}
		tx.Create(&newRating)
	}

	// 3. Update Tags
	if body.TagsInput != "" {
		tagNames := strings.Split(body.TagsInput, ",")
		var attachedTags []models.Tag

		for _, name := range tagNames {
			tagName := strings.TrimSpace(name)
			if tagName == "" {
				continue
			}
			var tag models.Tag
			if err := tx.FirstOrCreate(&tag, models.Tag{Name: tagName}).Error; err != nil {
				tx.Rollback()
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal memproses tag"})
				return
			}
			attachedTags = append(attachedTags, tag)
		}
		
		// Replace tags
		if err := tx.Model(&cafe).Association("Tags").Replace(attachedTags); err != nil {
			tx.Rollback()
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal update tags"})
			return
		}
	}

	tx.Commit()

	c.JSON(http.StatusOK, gin.H{"message": "Kafe berhasil diperbarui!", "cafe": cafe})
}

// DELETE CAFE

func DeleteCafe(c *gin.Context) {
	cafeID := c.Param("id")
	
	// Check ownership before delete
	var cafe models.Cafe
	if err := initializers.DB.First(&cafe, cafeID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Kafe tidak ditemukan"})
		return
	}

	user, _ := c.Get("user")
	userID := user.(models.User).ID

	if cafe.UserID != userID {
		c.JSON(http.StatusForbidden, gin.H{"error": "Anda tidak memiliki izin untuk menghapus kafe ini"})
		return
	}

	result := initializers.DB.Delete(&models.Cafe{}, cafeID)

	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menghapus kafe"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Kafe berhasil dihapus"})
}
