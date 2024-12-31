package message

import (
	"sync"

	"localdomain/webhook/core"
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
func (ctx *Server) Start(wg *sync.WaitGroup) (err error) {
	return err
}

// Shutdown comment
func (ctx *Server) Shutdown() {
	if ctx.msq != nil {
		ctx.msq.Dispose()
	}
}
