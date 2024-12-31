package core

import (
	"net/url"

	"github.com/golang/groupcache"
)

// QueryRowLimit comment
const QueryRowLimit = 100

// MySQLConnectionConfig ...
type MySQLConnectionConfig struct {
	User         string `json:"user"`
	Password     string `json:"password"`
	Host         string `json:"host"`
	Port         string `json:"port"`
	Type         string `json:"type"`
	MaxIdleConns int    `json:"maxIdleConns"`
	MaxOpenConns int    `json:"maxOpenConns"`
}

// ClusterHostNames comment
type ClusterHostNames struct {
	APIRequest string `json:"system.api"`
}

// ConfigFile comment
type ConfigFile struct {
	Debug                 bool                  `json:"debug"`
	Port                  string                `json:"port"`
	HostName              string                `json:"hostName"`
	ClusterHostNames      ClusterHostNames      `json:"clusterHostNames"`
	MySQL                 MySQLConnectionConfig `json:"mysql"`
	MySQLConnectionString string                `json:"mysqlConnectionString"`
	AMQPConnectionString  string                `json:"amqpConnectionString"`
	DataDir               string                `json:"dataDir"`
}

// Config comment
type Config struct {
	ConfigFile
	AppDir     string
	GroupCache *groupcache.Group
}

// APIRequest comment
type APIRequest struct {
	cfg            *Config
	UserID         string
	OrganizationID string
	URL            *url.URL
	PostData       *url.Values
}
