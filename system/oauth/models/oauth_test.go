package models_test

import (
	"database/sql/driver"
	"testing"

	"localdomain/oauth/models"

	"github.com/stretchr/testify/assert"
)

func TestNewAccessToken(t *testing.T) {
	var (
		client      = &models.OauthClient{MyGormModel: models.MyGormModel{ID: "1"}}
		user        = &models.OauthUser{MyGormModel: models.MyGormModel{ID: "2"}}
		accessToken *models.OauthAccessToken
		v           driver.Value
		err         error
	)

	// When user object is nil
	accessToken = models.NewOauthAccessToken(
		client,                 // client
		nil,                    // user
		3600,                   // expires in
		"scope doesn't matter", // scope
	)

	// accessToken.ClientID.Valid should be true
	assert.True(t, accessToken.ClientID.Valid)

	// accessToken.ClientID.Value() should return the object id, in this case string(1)
	v, err = accessToken.ClientID.Value()
	assert.Nil(t, err)
	assert.Equal(t, string("1"), v)

	// accessToken.UserID.Valid should be false
	assert.False(t, accessToken.UserID.Valid)

	// accessToken.UserID.Value() should return nil
	v, err = accessToken.UserID.Value()
	assert.Nil(t, err)
	assert.Nil(t, v)

	// When user object is not nil
	accessToken = models.NewOauthAccessToken(
		client,                 // client
		user,                   // user
		3600,                   // expires in
		"scope doesn't matter", // scope
	)

	// accessToken.ClientID.Valid should be true
	assert.True(t, accessToken.ClientID.Valid)

	// accessToken.ClientID.Value() should return the object id, in this case string(1)
	v, err = accessToken.ClientID.Value()
	assert.Nil(t, err)
	assert.Equal(t, string("1"), v)

	// accessToken.UserID.Valid should be true
	assert.True(t, accessToken.UserID.Valid)

	// accessToken.UserID.Value() should return the object id, in this case string(2)
	v, err = accessToken.UserID.Value()
	assert.Nil(t, err)
	assert.Equal(t, string("2"), v)
}

func TestNewRefreshToken(t *testing.T) {
	var (
		client       = &models.OauthClient{MyGormModel: models.MyGormModel{ID: "1"}}
		user         = &models.OauthUser{MyGormModel: models.MyGormModel{ID: "2"}}
		refreshToken *models.OauthRefreshToken
		v            driver.Value
		err          error
	)

	// When user object is nil
	refreshToken = models.NewOauthRefreshToken(
		client,                 // client
		nil,                    // user
		1209600,                // expires in
		"scope doesn't matter", // scope
	)

	// refreshToken.ClientID.Valid should be true
	assert.True(t, refreshToken.ClientID.Valid)

	// refreshToken.ClientID.Value() should return the object id, in this case string(1)
	v, err = refreshToken.ClientID.Value()
	assert.Nil(t, err)
	assert.Equal(t, string("1"), v)

	// refreshToken.UserID.Valid should be false
	assert.False(t, refreshToken.UserID.Valid)

	// refreshToken.UserID.Value() should return nil
	v, err = refreshToken.UserID.Value()
	assert.Nil(t, err)
	assert.Nil(t, v)

	// When user object is not nil
	refreshToken = models.NewOauthRefreshToken(
		client,                 // client
		user,                   // user
		1209600,                // expires in
		"scope doesn't matter", // scope
	)

	// accessToken.ClientID.Valid should be true
	assert.True(t, refreshToken.ClientID.Valid)

	// accessToken.ClientID.Value() should return the object id, in this case string(1)
	v, err = refreshToken.ClientID.Value()
	assert.Nil(t, err)
	assert.Equal(t, string("1"), v)

	// refreshToken.UserID.Valid should be true
	assert.True(t, refreshToken.UserID.Valid)

	// refreshToken.UserID.Value() should return the object id, in this case string(2)
	v, err = refreshToken.UserID.Value()
	assert.Nil(t, err)
	assert.Equal(t, string("2"), v)
}

func TestNewAuthorizationCode(t *testing.T) {
	var (
		client            = &models.OauthClient{MyGormModel: models.MyGormModel{ID: "1"}}
		user              = &models.OauthUser{MyGormModel: models.MyGormModel{ID: "2"}}
		authorizationCode *models.OauthAuthorizationCode
		v                 driver.Value
		err               error
	)

	// When user object is not nil
	authorizationCode = models.NewOauthAuthorizationCode(
		client,                        // client
		user,                          // user
		3600,                          // expires in
		"redirect URI doesn't matter", // redirect URI
		"scope doesn't matter",        // scope
	)

	// authorizationCode.ClientID.Valid should be true
	assert.True(t, authorizationCode.ClientID.Valid)

	// authorizationCode.ClientID.Value() should return the object id, in this case string(1)
	v, err = authorizationCode.ClientID.Value()
	assert.Nil(t, err)
	assert.Equal(t, string("1"), v)

	// authorizationCode.UserID.Valid should be true
	assert.True(t, authorizationCode.UserID.Valid)

	// authorizationCode.UserID.Value() should return the object id, in this case string(2)
	v, err = authorizationCode.UserID.Value()
	assert.Nil(t, err)
	assert.Equal(t, string("2"), v)
}
