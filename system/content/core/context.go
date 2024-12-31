package core

import (
	"net/http"
	"net/http/cookiejar"

	"github.com/gin-gonic/gin"
	"github.com/go-redis/redis/v8"
	"github.com/golang/groupcache"
)

// HTTPClientJar comment
var HTTPClientJar, _ = cookiejar.New(nil)

// HTTPClient comment
var HTTPClient = &http.Client{Jar: HTTPClientJar}

// RedisConnectionConfig ...
type RedisConnectionConfig struct {
	DBName   int    `json:"dbName"`
	Host     string `json:"host"`
	Port     string `json:"port"`
	Password string `json:"password"`
}

// ConfigFile comment
type ConfigFile struct {
	Debug                   bool                  `json:"debug"`
	Port                    string                `json:"port"`
	HostName                string                `json:"hostName"`
	ClusterHostName         string                `json:"clusterHostName"`
	DownloadClusterHostName string                `json:"downloadClusterHostName"`
	Redis                   RedisConnectionConfig `json:"redis"`
}

// Config comment
type Config struct {
	ConfigFile
	GroupCache *groupcache.Group
}

type Server struct {
	Config          *Config
	Router          *gin.Engine
	RedisConnection redis.UniversalClient
}

// FileInfo comment
type FileInfo struct {
	SourceURL       string `json:"sourceUrl"`
	DownloadURL     string `json:"downloadUrl"`
	DownloadedCount int64  `json:"downloadedCount"`
	FileName        string `json:"fileName"`
	FileSize        int64  `json:"fileSize"`
}

// DownloadSession comment
type DownloadSession struct {
	cfg             *Config
	conn            redis.UniversalClient
	requestFilePath string

	ID            string `json:"id"`
	FileKey       string `json:"fileKey"`
	FilePath      string `json:"filePath"`
	CreatorID     string `json:"creatorId"`
	DownloadLimit int64  `json:"downloadLimit"`
	ExpirationDay int64  `json:"expirationDay"`

	Files          []*FileInfo `json:"files"`
	DownloadedSize int64
}

type DownloadLinkResponse struct {
	Results struct {
		ID            string      `json:"id"`
		CreatorID     interface{} `json:"creatorId"`
		DownloadLimit int         `json:"downloadLimit"`
		ExpirationDay int         `json:"expirationDay"`
		Files         []struct {
			SourceURL   string `json:"sourceUrl"`
			DownloadURL string `json:"downloadUrl"`
			ShortenURL  string `json:"shortenUrl"`
			FileName    string `json:"fileName"`
			FileSize    string `json:"fileSize"`
		} `json:"files"`
	} `json:"results"`
}
