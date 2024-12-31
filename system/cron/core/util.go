package core

import (
	"bytes"
	"math/rand"
	"os"
	"strings"
	"time"
)

// GetAppDir comment
func GetAppDir() (appDir string, err error) {
	pwd, err := os.Getwd()
	if err != nil {
		return pwd, err
	}
	return pwd, nil
}

// BuildString comment
func BuildString(parts ...string) string {
	var buf bytes.Buffer
	for _, val := range parts {
		buf.WriteString(val)
	}
	return buf.String()
}

var src = rand.NewSource(time.Now().UnixNano())

const letterBytes = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"
const (
	letterIdxBits = 6                    // 6 bits to represent a letter index
	letterIdxMask = 1<<letterIdxBits - 1 // All 1-bits, as many as letterIdxBits
	letterIdxMax  = 63 / letterIdxBits   // # of letter indices fitting in 63 bits
)

// RandStringBytesMask comment
func RandStringBytesMask(n int) string {
	sb := strings.Builder{}
	sb.Grow(n)
	// A src.Int63() generates 63 random bits, enough for letterIdxMax characters!
	for i, cache, remain := n-1, src.Int63(), letterIdxMax; i >= 0; {
		if remain == 0 {
			cache, remain = src.Int63(), letterIdxMax
		}
		if idx := int(cache & letterIdxMask); idx < len(letterBytes) {
			sb.WriteByte(letterBytes[idx])
			i--
		}
		cache >>= letterIdxBits
		remain--
	}

	return sb.String()
}
