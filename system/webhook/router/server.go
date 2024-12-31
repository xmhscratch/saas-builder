package router

import (
	"sync"

	"localdomain/webhook/core"
)

// NewServer comment
func NewServer(cfg *core.Config) (*Server, error) {
	msq, err := NewPublisher(cfg)
	if err != nil {
		return nil, err
	}

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
}
