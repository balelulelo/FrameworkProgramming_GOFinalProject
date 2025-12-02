package models

import (
	"gorm.io/gorm"
)

// ==========================================
// 1. TABEL CAFE (Data Faktual)
// ==========================================
type Cafe struct {
	gorm.Model // ID, CreatedAt, UpdatedAt, DeletedAt

	Name      string  `gorm:"type:varchar(255);not null" json:"name"`
	Address   string  `gorm:"type:text" json:"address"`
	Latitude  float64 `json:"latitude"`
	Longitude float64 `json:"longitude"`

	// Foreign Key
	UserID uint `json:"user_id"`

	// --- RELASI ---

	// One-to-Many: Satu Cafe punya banyak Rating
	Ratings []PersonalRating `gorm:"foreignKey:CafeID" json:"ratings"`

	// Many-to-Many: Satu Cafe punya banyak Tag
	// GORM akan otomatis membuat tabel 'cafe_tags'
	Tags []Tag `gorm:"many2many:cafe_tags;" json:"tags"`
}

// ==========================================
// 2. TABEL PERSONAL RATING (Data Subjektif)
// ==========================================
type PersonalRating struct {
	gorm.Model

	// Foreign Keys
	UserID uint `json:"user_id"`
	CafeID uint `json:"cafe_id"`

	// Detail Rating
	AmbienceRating int    `gorm:"not null" json:"ambience_rating"`
	ServiceRating  int    `gorm:"not null" json:"service_rating"`
	PriceLevel     string `gorm:"type:varchar(50)" json:"price_level"`  // Murah/Sedang/Mahal
	MenuVariety    string `gorm:"type:varchar(50)" json:"menu_variety"` // Minim/Lengkap
	Notes          string `gorm:"type:text" json:"notes"`
}

// ==========================================
// 3. TABEL TAG (Label)
// ==========================================
type Tag struct {
	gorm.Model
	Name string `gorm:"type:varchar(100);unique;not null" json:"name"`
}

// Override nama tabel untuk struct Cafe
func (Cafe) TableName() string {
	return "cafes"
}
