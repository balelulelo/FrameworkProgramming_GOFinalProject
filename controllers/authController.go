package controllers

import (
	"net/http"
	"os"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"github.com/rizqy/cafetify/initializers"
	"github.com/rizqy/cafetify/models"
	"golang.org/x/crypto/bcrypt"
)

// ---------------------------
// user registration
// ---------------------------
func Register(c *gin.Context) {
	// get input from json body
	var body struct {
		Username string
		Email    string
		Password string
	}

	if c.Bind(&body) != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Gagal membaca input"})
		return
	}

	// Hash Password
	// For security, we must not store the plain password in the database.
	hash, err := bcrypt.GenerateFromPassword([]byte(body.Password), 10)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal meng-hash password"})
		return
	}

	// Save user to database
	user := models.User{
		Username: body.Username,
		Email:    body.Email,
		Password: string(hash), // Save hash instead of plain password
	}

	result := initializers.DB.Create(&user)

	if result.Error != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Gagal membuat user (Email mungkin sudah ada)"})
		return
	}

	// Send Success Response
	c.JSON(http.StatusOK, gin.H{"message": "Registrasi berhasil! Silakan login."})
}

// ---------------------------
// USER LOGIN
// ---------------------------
func Login(c *gin.Context) {
	// input from json body (email and pw)
	var body struct {
		Email    string
		Password string
	}

	if c.Bind(&body) != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Gagal membaca input"})
		return
	}

	// find user based on email
	var user models.User
	initializers.DB.First(&user, "email = ?", body.Email)

	if user.ID == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Email atau password salah"})
		return
	}

	// check password by comparing the hash
	err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(body.Password))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Email atau password salah"})
		return
	}

	// create JWT token (access)
	// only available for 30 days
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"sub": user.ID,                                    // Subject (ID User)
		"exp": time.Now().Add(time.Hour * 24 * 30).Unix(), // expires in 30 days
	})

	// Sign the  token with our JWT_SECRET
	tokenString, err := token.SignedString([]byte(os.Getenv("JWT_SECRET")))

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create token"})
		return
	}

	// send token in cookie

	c.SetSameSite(http.SameSiteLaxMode)
	c.SetCookie("Authorization", tokenString, 3600*24*30, "", "", false, true)

	c.JSON(http.StatusOK, gin.H{
		"message": "Login berhasil!",
		"token":   tokenString, // send to body as well to test via Postman
	})
}

// get profile (or view your own profile)
func GetProfile(c *gin.Context) {
	// get user that was set by middleware
	user, _ := c.Get("user")
	c.JSON(http.StatusOK, gin.H{"user": user})
}

// update profile

func UpdateProfile(c *gin.Context) {
	userContext, _ := c.Get("user")
	currentUser := userContext.(models.User)

	var body struct {
		Username string
		Email    string
	}

	if c.Bind(&body) != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Input tidak valid"})
		return
	}

	// Update data di database
	initializers.DB.Model(&currentUser).Updates(models.User{
		Username: body.Username,
		Email:    body.Email,
	})

	c.JSON(http.StatusOK, gin.H{
		"message": "Profil berhasil diperbarui",
		"user":    currentUser,
	})
}

// change password

func ChangePassword(c *gin.Context) {
	userContext, _ := c.Get("user")
	currentUser := userContext.(models.User)

	var body struct {
		OldPassword string `json:"old_password" binding:"required"`
		NewPassword string `json:"new_password" binding:"required"`
	}

	if c.ShouldBindJSON(&body) != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Input password tidak lengkap"})
		return
	}

	//  check old password
	err := bcrypt.CompareHashAndPassword([]byte(currentUser.Password), []byte(body.OldPassword))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Password lama salah!"})
		return
	}

	// hash new password
	newHash, err := bcrypt.GenerateFromPassword([]byte(body.NewPassword), 10)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal memproses password baru"})
		return
	}

	// save the new pw to DB
	initializers.DB.Model(&currentUser).Update("password", string(newHash))

	c.JSON(http.StatusOK, gin.H{"message": "Password berhasil diubah!"})
}
