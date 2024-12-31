package oauth

import (
	"localdomain/oauth/core"
	"localdomain/oauth/oauth/roles"

	"github.com/jinzhu/gorm"
)

// Service struct keeps objects to avoid passing them around
type Service struct {
	cfg          *core.Config
	db           *gorm.DB
	allowedRoles []string
}

// NewService returns a new Service instance
func NewService(cfg *core.Config, db *gorm.DB) *Service {
	return &Service{
		cfg:          cfg,
		db:           db,
		allowedRoles: []string{roles.Superuser, roles.User},
	}
}

// GetConfig returns core.Config instance
func (s *Service) GetConfig() *core.Config {
	return s.cfg
}

// RestrictToRoles restricts this service to only specified roles
func (s *Service) RestrictToRoles(allowedRoles ...string) {
	s.allowedRoles = allowedRoles
}

// IsRoleAllowed returns true if the role is allowed to use this service
func (s *Service) IsRoleAllowed(role string) bool {
	for _, allowedRole := range s.allowedRoles {
		if role == allowedRole {
			return true
		}
	}
	return false
}

// Close stops any running services
func (s *Service) Close() {}
