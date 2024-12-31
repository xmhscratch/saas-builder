package timer

import (
	"log"
	"sync"

	"localdomain/cron-scheduler/core"
)

// NewServer comment
func NewServer(cfg *core.Config, cronNames []string) (*Server, error) {
	cronTab, err := NewCronTab(cfg, cronNames)
	if err != nil {
		return nil, err
	}

	ctx := &Server{
		cfg:     cfg,
		cronTab: cronTab,
	}

	return ctx, err
}

// Start comment
func (ctx *Server) Start() (err error) {
	ctx.wg = &sync.WaitGroup{}

	ctx.wg.Add(1)
	defer ctx.wg.Wait()

	log.Println("Service scheduler timer started")
	return err
}

// Shutdown comment
func (ctx *Server) Shutdown() {
	if ctx.wg != nil {
		ctx.wg.Done()
	}

	if ctx.cronTab != nil {
		ctx.cronTab.Dispose()
	}
}
