package middleware

import (
	"fmt"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"github.com/rizqy/cafetify/initializers"
	"github.com/rizqy/cafetify/models"
)

func RequireAuth(c *gin.Context) {
	// 1. Coba ambil token dari Cookie
	tokenString, _ := c.Cookie("Authorization")

	// ika di Cookie kosong, coba ambil dari Header Authorization
	if tokenString == "" {
		authHeader := c.GetHeader("Authorization")
		// Format header biasanya: "Bearer <token>" atau langsung "<token>"
		// Kita ambil tokennya saja
		if authHeader != "" {
			tokenString = strings.TrimPrefix(authHeader, "Bearer ")
			tokenString = strings.TrimSpace(tokenString)
		}
	}

	// jika masih kosong, tolak akses
	if tokenString == "" {
		c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized: Token tidak ditemukan"})
		return
	}

	// 2. Validasi/Decode Token
	token, _ := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		// Pastikan metode signing-nya benar (HMAC)
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}
		// Kembalikan kunci rahasia untuk membuka segel token
		return []byte(os.Getenv("JWT_SECRET")), nil
	})

	// 3. Cek apakah Token Valid & Belum Kadaluarsa
	if claims, ok := token.Claims.(jwt.MapClaims); ok && token.Valid {
		// Cek kadaluarsa
		if float64(time.Now().Unix()) > claims["exp"].(float64) {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Sesi habis, silakan login ulang"})
			return
		}

		// 4. Cari User di Database berdasarkan ID di token ("sub")
		var user models.User
		initializers.DB.First(&user, claims["sub"])

		if user.ID == 0 {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "User tidak ditemukan"})
			return
		}

		// 5. Simpan data User ke Context (agar bisa dipakai di Controller nanti)
		c.Set("user", user)

		// Lanjut ke Controller selanjutnya
		c.Next()

	} else {
		c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Token tidak valid"})
	}
}
