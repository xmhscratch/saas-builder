package util

import (
	"github.com/dgrijalva/jwt-go"
)

// GenerateToken comment
func GenerateToken(key string) (string, error) {
	// Create the Claims
	claims := &jwt.StandardClaims{
		ExpiresAt: 15000,
		Issuer:    "oauth",
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(key))
}
