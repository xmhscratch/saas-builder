package core

import (
	"bytes"
	"os"
)

// BuildString comment
func BuildString(parts ...string) string {
	var buf bytes.Buffer
	for _, val := range parts {
		buf.WriteString(val)
	}
	return buf.String()
}

// GetAppDir comment
func GetAppDir() (appDir string, err error) {
	pwd, err := os.Getwd()
	if err != nil {
		return pwd, err
	}
	return pwd, nil
}
