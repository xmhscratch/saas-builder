package worker

// core packages
import (
	"log"
	"sync"

	"localdomain/cron-scheduler/core"
)

// NewServer comment
func NewServer(cfg *core.Config) (*Server, error) {
	msq := NewConsumer(cfg)

	ctx := &Server{
		cfg: cfg,
		msq: msq,
	}

	return ctx, nil
}

// Start comment
func (ctx *Server) Start() (err error) {
	ctx.wg = &sync.WaitGroup{}

	ctx.wg.Add(1)
	defer ctx.wg.Wait()

	log.Println("Service scheduler worker started")
	return err
}

// Shutdown comment
func (ctx *Server) Shutdown() {
	if ctx.wg != nil {
		ctx.wg.Done()
	}

	if ctx.msq != nil {
		ctx.msq.Dispose()
	}
}
