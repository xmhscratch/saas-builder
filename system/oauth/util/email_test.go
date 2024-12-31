package util_test

import (
	"testing"

	"localdomain/oauth/util"

	"github.com/stretchr/testify/assert"
)

func TestValidateEmail(t *testing.T) {
	assert.False(t, util.ValidateEmail("test@user"))
	assert.True(t, util.ValidateEmail("test@user.com"))
}
