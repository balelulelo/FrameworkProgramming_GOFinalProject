package models

import "gorm.io/gorm"

type User struct {
	gorm.Model // Automatically create ID, CreatedAt, UpdatedAt, DeletedAt

	// `gorm:"unique"` -> email cant be duplicated in DB
	// `json:"email"` -> change the key to "email" when sent to postman
	Email string `gorm:"unique" json:"email"`

	// Password is not shown in JSON Response for security reasons
	Password string `json:"-"`

	Username string `json:"username"`
}
