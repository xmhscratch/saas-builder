package core

// core packages
import (
	"context"
	"encoding/json"
	"errors"
	"log"
	"os"
	"path"

	"github.com/golang/groupcache"
	"github.com/joho/godotenv"
)

// NewConfig comment
func NewConfig() (*Config, error) {
	cfg := new(Config)

	cfg.GroupCache = groupcache.NewGroup("global_config", 64<<20, groupcache.GetterFunc(
		func(ctx context.Context, key string, dest groupcache.Sink) error {
			data, err := cfg.Load(key)
			if err != nil {
				return errors.New("config not found")
			}
			dest.SetBytes(data)
			return nil
		},
	))

	appDir, err := GetAppDir()
	if err != nil {
		return cfg, err
	}

	envFile := path.Join(appDir, ".env")
	if _, err := os.Stat(envFile); err == nil {
		if err = godotenv.Load(envFile); err != nil {
			// log.Fatal("Error loading .env file")
			return cfg, err
		}
	}

	if err := cfg.Init(os.Getenv("GO_ENV")); err != nil {
		return cfg, err
	}

	hostAddress := BuildString("http://", cfg.ClusterHostName, ":", cfg.Port)
	peers := groupcache.NewHTTPPool(hostAddress)
	peers.Set(hostAddress)

	return cfg, err
}

// // GlobalGroupCache comment
// var GlobalGroupCache

// Init comment
func (cfg *Config) Init(scopeName string) (err error) {
	var data []byte

	if scopeName == "" {
		scopeName = "development"
	}

	err = cfg.GroupCache.Get(nil, scopeName,
		groupcache.AllocatingByteSliceSink(&data))

	if err != nil {
		return
	}

	err = json.Unmarshal(data, &cfg)
	return err
}

// Load comment
func (cfg *Config) Load(key string) (data []byte, err error) {
	appDir, err := GetAppDir()
	if err != nil {
		return data, err
	}

	configFile, err := os.Open(path.Join(appDir, "config."+key+".json"))
	if err != nil {
		log.Println(err)
	}
	defer configFile.Close()

	jsonParser := json.NewDecoder(configFile)
	jsonParser.Decode(&cfg)

	return json.Marshal(cfg)
}
