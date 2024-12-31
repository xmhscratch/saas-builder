package proxy

import (
	"localdomain/oauth/core"
	"localdomain/oauth
)

// Service struct keeps variables for reuse
type Service struct {
	cfg          *core.Config
	oauthService oauth.ServiceInterface
}

// NewService returns a new Service instance
func NewService(cfg *core.Config, oauthService oauth.ServiceInterface) *Service {
	return &Service{
		cfg:          cfg,
		oauthService: oauthService,
	}
}

// GetConfig returns core.Config instance
func (s *Service) GetConfig() *core.Config {
	return s.cfg
}

// GetOauthService returns oauth.Service instance
func (s *Service) GetOauthService() oauth.ServiceInterface {
	return s.oauthService
}

// Close stops any running services
func (s *Service) Close() {}
