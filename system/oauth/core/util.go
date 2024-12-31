package core

import (
	"bytes"
	"os"
	"net/url"
	"strings"
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

// NormalizeRawURLString comment
func NormalizeRawURL(input string) (*url.URL, error) {
	urlRouteURI, err := url.Parse(input)
	if err != nil {
		return urlRouteURI, err
	}
	oldRawQuery := urlRouteURI.RawQuery
	urlRouteURI.RawQuery = ""
	urlRouteURI, err = url.Parse(strings.TrimSuffix(urlRouteURI.String(), "/"))
	if err != nil {
		return urlRouteURI, err
	}
	urlRouteURI.RawQuery = oldRawQuery
	return urlRouteURI, nil
}

// NormalizeRawURLString comment
func NormalizeRawURLString(input string) (string, error) {
	urlRouteURI, err := NormalizeRawURL(input)
	return urlRouteURI.String(), err
}
