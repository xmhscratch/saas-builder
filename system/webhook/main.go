package main

import (
	"log"
	"sync"

	"localdomain/webhook/core"
	"localdomain/webhook/message"
	"localdomain/webhook/router"
)

func main() {
	var wg sync.WaitGroup

	defer func() {
		if rec := recover(); rec != nil {
			log.Println(rec)
		}
	}()

	cfg, err := core.NewConfig("")
	if err != nil {
		panic(err)
	}

	wg.Add(1)
	go func() {
		if svr, err := router.NewServer(cfg); err != nil {
			wg.Done()
			svr.Shutdown()

			panic(err)
		}
	}()

	wg.Add(1)
	go func() {
		if svr, err := message.NewServer(cfg); err != nil {
			wg.Done()
			svr.Shutdown()

			panic(err)
		}
	}()

	wg.Wait()
}
