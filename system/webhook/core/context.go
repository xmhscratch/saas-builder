package core

import (
	"bytes"
	"os"

	"github.com/golang/groupcache"
)

// ConfigFile comment
type ConfigFile struct {
	Debug                 bool   `json:"debug"`
	Port                  string `json:"port"`
	HostName              string `json:"hostName"`
	ClusterHostName       string `json:"clusterHostName"`
	MySQLConnectionString string `json:"mysqlConnectionString"`
	AMQPConnectionString  string `json:"amqpConnectionString"`
}

// Config comment
type Config struct {
	ConfigFile
	AppDir     string
	GroupCache *groupcache.Group
}

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
