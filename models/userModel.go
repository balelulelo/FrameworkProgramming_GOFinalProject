package models

import "gorm.io/gorm"

type User struct {
	gorm.Model // Otomatis bikin ID, CreatedAt, UpdatedAt, DeletedAt

	// `gorm:"unique"` -> Email tidak boleh kembar
	// `json:"email"` -> Saat dikirim ke Postman, key-nya jadi huruf kecil "email"
	Email    string `gorm:"unique" json:"email"`
	
	// Password tidak kita tampilkan di JSON response demi keamanan (opsional, tapi good practice)
	Password string `json:"-"` 
	
	Username string `json:"username"`
}