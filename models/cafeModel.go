package models

import (
	"gorm.io/gorm"
)

// ==========================================
// 1. TABEL CAFE
// ==========================================
type Cafe struct {
	gorm.Model // ID, CreatedAt, UpdatedAt, DeletedAt

	Name      string  `gorm:"type:varchar(255);not null" json:"name"`
	Address   string  `gorm:"type:text" json:"address"`
	Latitude  float64 `json:"latitude"`
	Longitude float64 `json:"longitude"`

	// Foreign Key
	UserID uint `json:"user_id"`

	// --- Relations ---

	User User `gorm:"foreignKey:UserID" json:"user"`

	// One-to-Many: One cafe can have many Personal Ratings
	Ratings []PersonalRating `gorm:"foreignKey:CafeID" json:"ratings"`

	// Many-to-Many: Cafe can have many Tags
	Tags []Tag `gorm:"many2many:cafe_tags;" json:"tags"`
}

// ==========================================
// 2. TABEL PERSONAL RATING
// ==========================================
type PersonalRating struct {
	gorm.Model

	// Foreign Keys
	UserID uint `json:"user_id"`
	CafeID uint `json:"cafe_id"`

	// Detail Rating
	AmbienceRating int    `gorm:"not null" json:"ambience_rating"`
	ServiceRating  int    `gorm:"not null" json:"service_rating"`
	PriceLevel     string `gorm:"type:varchar(50)" json:"price_level"`
	MenuVariety    string `gorm:"type:varchar(50)" json:"menu_variety"`
	Notes          string `gorm:"type:text" json:"notes"`
}

// ==========================================
// 3. TABEL TAG
// ==========================================
type Tag struct {
	gorm.Model
	Name string `gorm:"type:varchar(100);unique;not null" json:"name"`
}

// Override table name for cafe
func (Cafe) TableName() string {
	return "cafes"
}
