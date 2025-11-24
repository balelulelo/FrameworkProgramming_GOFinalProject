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
// FITUR 1: REGISTRASI USER
// ---------------------------
func Register(c *gin.Context) {
	// 1. Tangkap Input dari Body JSON
	var body struct {
		Username string
		Email    string
		Password string
	}

	if c.Bind(&body) != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Gagal membaca input"})
		return
	}

	// 2. Hash Password (Acak Password)
	// Kita tidak boleh menyimpan password asli di database demi keamanan.
	hash, err := bcrypt.GenerateFromPassword([]byte(body.Password), 10)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal meng-hash password"})
		return
	}

	// 3. Simpan User ke Database
	user := models.User{
		Username: body.Username,
		Email:    body.Email,
		Password: string(hash), // Simpan hasil hash, bukan password asli
	}

	result := initializers.DB.Create(&user)

	if result.Error != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Gagal membuat user (Email mungkin sudah ada)"})
		return
	}

	// 4. Berikan Respon Sukses
	c.JSON(http.StatusOK, gin.H{"message": "Registrasi berhasil! Silakan login."})
}

// ---------------------------
// FITUR 2: LOGIN USER
// ---------------------------
func Login(c *gin.Context) {
	// 1. Tangkap Input (Email & Password)
	var body struct {
		Email    string
		Password string
	}

	if c.Bind(&body) != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Gagal membaca input"})
		return
	}

	// 2. Cari User berdasarkan Email
	var user models.User
	initializers.DB.First(&user, "email = ?", body.Email)

	if user.ID == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Email atau password salah"})
		return
	}

	// 3. Cek Password (Bandingkan Hash)
	err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(body.Password))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Email atau password salah"})
		return
	}

	// 4. Buat JWT Token (Kunci Akses)
	// Token ini berlaku selama 30 hari
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"sub": user.ID,                            // Subject (ID User)
		"exp": time.Now().Add(time.Hour * 24 * 30).Unix(), // Kadaluarsa 30 hari
	})

	// Tanda tangani token dengan Rahasia Dapur kita (.env)
	tokenString, err := token.SignedString([]byte(os.Getenv("JWT_SECRET")))

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal membuat token"})
		return
	}

	// 5. Kirim Token lewat Cookie
	// "Authorization" adalah nama cookie-nya
	// 3600 * 24 * 30 = 30 hari dalam detik
	c.SetSameSite(http.SameSiteLaxMode)
	c.SetCookie("Authorization", tokenString, 3600*24*30, "", "", false, true)

	c.JSON(http.StatusOK, gin.H{
		"message": "Login berhasil!",
		"token":   tokenString, // Kita kirim juga di body untuk testing Postman
	})
}