package web

import (
	"encoding/json"
	"errors"
	"net/http"

	"localdomain/oauth/models"
	"localdomain/oauth
	"github.com/gomodule/redigo/redis"
	"github.com/gorilla/context"
)

type contextKey int

// // AccountSessionUser comment
// type AccountSessionUser struct {
// 	ID           string    `json:"id"`
// 	Username     string    `json:"username"`
// 	EmailAddress string    `json:"emailAddress"`
// 	Password     string    `json:"password"`
// 	RawPassword  string    `json:"rawPassword"`
// 	CreatedAt    time.Time `json:"createdAt"`
// 	UpdatedAt    time.Time `json:"updatedAt"`
// 	Status       int32     `json:"status"`
// 	MemberID     string    `json:"memberId"`
// }

// AccountSession comment
type AccountSession struct {
	Cookie  interface{} `json:"cookie"`
	HomeURL string      `json:"homeUrl"`
	UserID  string      `json:"user"`
}

const (
	sessionServiceKey contextKey = 0
	clientKey         contextKey = 1
)

var (
	// ErrSessionServiceNotPresent ...
	ErrSessionServiceNotPresent = errors.New("Session service not present in the request context")
	// ErrClientNotPresent ...
	ErrClientNotPresent = errors.New("Client not present in the request context")
)

// Returns *session.Service from the request context
func getSessionService(r *http.Request) (session.ServiceInterface, error) {
	val, ok := context.GetOk(r, sessionServiceKey)
	if !ok {
		return nil, ErrSessionServiceNotPresent
	}

	sessionService, ok := val.(session.ServiceInterface)
	if !ok {
		return nil, ErrSessionServiceNotPresent
	}

	return sessionService, nil
}

// Returns *oauth.Client from the request context
func getClient(r *http.Request) (*models.OauthClient, error) {
	val, ok := context.GetOk(r, clientKey)
	if !ok {
		return nil, ErrClientNotPresent
	}

	client, ok := val.(*models.OauthClient)
	if !ok {
		return nil, ErrClientNotPresent
	}

	return client, nil
}

func clearUserSession(s *Service, r *http.Request) (err error) {
	// Get the session service from the request context
	sessionService, err := getSessionService(r)
	if err != nil {
		return err
	}

	userSession, err := sessionService.GetUserSession()
	if err != nil {
		return err
	}

	// Delete the access and refresh tokens
	s.oauthService.ClearUserTokens(userSession)

	// Delete the user session
	sessionService.ClearUserSession()

	return err
}

func syncUserSession(sessionID string, s *Service, r *http.Request) (*session.UserSession, error) {
	// Get the session service from the request context
	sessionService, err := getSessionService(r)
	if err != nil {
		return nil, err
	}

	cfg := s.GetConfig()

	conn, err := redis.DialURL(cfg.RedisConnectionString)
	if err != nil {
		// log.Println(err)
		return nil, err
	}
	defer conn.Close()

	sessionKey := buildString("session_", sessionID)
	sessInfo, err := redis.String(conn.Do("GET", sessionKey))
	if err != nil {
		return nil, err
	}

	accountSession := &AccountSession{}
	err = json.Unmarshal([]byte(sessInfo), accountSession)
	if err != nil {
		return nil, err
	}

	userID := accountSession.UserID
	client, err := s.oauthService.FindClientByUserID(userID)
	if client == nil || err != nil {
		client, err = s.oauthService.CreateClient(
			string(sessionID),         // client ID
			"test_secret",             // secret
			"https://www.example.com", // redirect URI
			userID,
		)
	}

	// Authenticate the user
	user, err := s.oauthService.AuthUserByID(userID)
	if err != nil {
		return nil, err
	}

	// Get the scope string
	scope, err := s.oauthService.GetScope("read_write")
	if err != nil {
		return nil, err
	}

	// Log in the user
	accessToken, refreshToken, err := s.oauthService.Login(
		client,
		user,
		scope,
	)
	if err != nil {
		return nil, err
	}

	// Log in the user and store the user session in a cookie
	userSession := &session.UserSession{
		ClientID:     client.Key,
		Username:     user.Username,
		AccessToken:  accessToken.Token,
		RefreshToken: refreshToken.Token,
	}
	if err := sessionService.SetUserSession(userSession); err != nil {
		return nil, err
	}

	return userSession, err
}
