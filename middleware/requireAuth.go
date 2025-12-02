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
	// get token from cookie
	tokenString, _ := c.Cookie("Authorization")

	// if cookie is empty, check Authorization header
	if tokenString == "" {
		authHeader := c.GetHeader("Authorization")

		// format for header: "Bearer <token>"
		// get the token part only
		if authHeader != "" {
			tokenString = strings.TrimPrefix(authHeader, "Bearer ")
			tokenString = strings.TrimSpace(tokenString)
		}
	}

	// if token is still empty, return unauthorized
	if tokenString == "" {
		c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized: Token not found"})
		return
	}

	// 2. Validate Token
	token, _ := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		// make sure that the token method conform to "SigningMethodHMAC"
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}
		// return the secret signing key
		return []byte(os.Getenv("JWT_SECRET")), nil
	})

	// check if token is valid
	if claims, ok := token.Claims.(jwt.MapClaims); ok && token.Valid {
		// check token expiration
		if float64(time.Now().Unix()) > claims["exp"].(float64) {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Session Expired, Please Login Again"})
			return
		}

		// find user with token sub (user ID)
		var user models.User
		initializers.DB.First(&user, claims["sub"])

		if user.ID == 0 {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "User not found"})
			return
		}

		// save user to context
		c.Set("user", user)

		// continue to next handler
		c.Next()

	} else {
		c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Invalid Token"})
	}
}
