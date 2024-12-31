package main

// core packages
import (
	"context"
	"log"

	"localdomain/content/core"

	"github.com/go-redis/redis/v8"
)

func main() {
	defer func() {
		if rec := recover(); rec != nil {
			log.Println(rec)
		}
	}()

	cfg, err := core.NewConfig()
	if err != nil {
		panic(err)
	}

	conn := redis.NewUniversalClient(&redis.UniversalOptions{
		// MasterName: "redis_master",
		Addrs:      []string{"redis_master:6379"},
		DB:         cfg.Redis.DBName,
		Username:   "",
		Password:   cfg.Redis.Password,
		MaxRetries: 3,
		// To route commands by latency or randomly, enable one of the following.
		// RouteByLatency: true,
		// RouteRandomly: true,
	})
	defer conn.Close()

	conn.Ping(context.Background())

	if svr, err := core.NewServer(cfg, conn); err != nil {
		panic(err)
	} else {
		if err := svr.Start(); err != nil {
			panic(err)
		}
	}
}
