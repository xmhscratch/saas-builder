package core

import (
	"github.com/golang/groupcache"
)

// DatabaseConfig stores database connection options
type DatabaseConfig struct {
	Type         string `json:"type"`
	Host         string `json:"host"`
	Port         int    `json:"port"`
	User         string `json:"user"`
	Password     string `json:"password"`
	DatabaseName string `json:"databaseName"`
	MaxIdleConns int    `json:"maxIdleConns"`
	MaxOpenConns int    `json:"maxOpenConns"`
}

// OauthConfig stores oauth service configuration options
type OauthConfig struct {
	AccessTokenLifetime  int `json:"accessTokenLifetime"`
	RefreshTokenLifetime int `json:"refreshTokenLifetime"`
	AuthCodeLifetime     int `json:"authCodeLifetime"`
}

// SessionConfig stores session configuration for the web app
type SessionConfig struct {
	Secret   string `json:"secret"`
	Path     string `json:"path"`
	MaxAge   int    `json:"maxAge"`
	HTTPOnly bool   `json:"httpOnly"`
}

// ConfigFile comment
type ConfigFile struct {
	Debug                 bool              `json:"debug"`
	Port                  string            `json:"port"`
	ClusterHostName       string            `json:"clusterHostName"`
	Database              *DatabaseConfig   `json:"database"`
	RedisConnectionString string            `json:"redisConnectionString"`
	Oauth                 *OauthConfig      `json:"oauth"`
	Session               *SessionConfig    `json:"session"`
	Domains               map[string]string `json:"domains"`
	AuthLoginURL          string            `json:"authLoginUrl"`
	DashboardURL          string            `json:"dashboardUrl"`
}

// Config comment
type Config struct {
	ConfigFile
	AppDir     string
	GroupCache *groupcache.Group
}
