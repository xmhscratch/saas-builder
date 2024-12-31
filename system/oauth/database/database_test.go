package database_test

import (
	"errors"
	"testing"

	"localdomain/oauth/core"
	"localdomain/oauth/database"

	"github.com/stretchr/testify/assert"
)

func TestNewDatabaseTypeNotSupported(t *testing.T) {
	cfg := &core.Config{
		Database: config.DatabaseConfig{
			Type: "bogus",
		},
	}
	_, err := database.NewDatabase(cfg)

	if assert.NotNil(t, err) {
		assert.Equal(t, errors.New("Database type bogus not suppported"), err)
	}
}
