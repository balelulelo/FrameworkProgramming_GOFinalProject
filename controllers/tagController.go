package controllers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/rizqy/cafetify/initializers"
	"github.com/rizqy/cafetify/models"
)

func GetAllTags(c *gin.Context) {
	var tags []models.Tag
	if result := initializers.DB.Find(&tags); result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengambil data tag"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"tags": tags})
}
