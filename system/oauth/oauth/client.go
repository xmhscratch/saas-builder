package oauth

import (
	"errors"
	"strings"
	"time"

	"localdomain/oauth/models"
	"localdomain/oauth
	"localdomain/oauthsword"
	"github.com/google/uuid"
	"github.com/jinzhu/gorm"
)

var (
	// ErrClientNotFound ...
	ErrClientNotFound = errors.New("Client not found")
	// ErrInvalidClientSecret ...
	ErrInvalidClientSecret = errors.New("Invalid client secret")
	// ErrClientIDTaken ...
	ErrClientIDTaken = errors.New("Client ID taken")
)

// ClientExists returns true if client exists
func (s *Service) ClientExists(clientID string) bool {
	_, err := s.FindClientByClientID(clientID)
	return err == nil
}

// FindClientByClientID looks up a client by client ID
func (s *Service) FindClientByClientID(clientID string) (*models.OauthClient, error) {
	// Client IDs are case insensitive
	client := new(models.OauthClient)
	notFound := s.db.
		Where("`"+client.TableName()+"`.`key` = ?", clientID).
		First(client).
		RecordNotFound()

	// Not found
	if clientID != "" && notFound == true {
		return nil, ErrClientNotFound
	}

	return client, nil
}

// FindClientByUserID looks up a client by user ID
func (s *Service) FindClientByUserID(userID string) (*models.OauthClient, error) {
	// Client IDs are case insensitive
	client := new(models.OauthClient)
	notFound := s.db.
		Where("`"+client.TableName()+"`.`user_id` = ?", userID).
		First(client).
		RecordNotFound()

	// Not found
	if userID != "" && notFound == true {
		return nil, ErrClientNotFound
	}

	return client, nil
}

// CreateClient saves a new client to database
func (s *Service) CreateClient(clientID, secret, redirectURI string, userID string) (*models.OauthClient, error) {
	return s.createClientCommon(s.db, clientID, secret, redirectURI, userID)
}

// CreateClientTx saves a new client to database using injected db object
func (s *Service) CreateClientTx(tx *gorm.DB, clientID, secret, redirectURI string, userID string) (*models.OauthClient, error) {
	return s.createClientCommon(tx, clientID, secret, redirectURI, userID)
}

// AuthClient authenticates client
func (s *Service) AuthClient(clientID, secret string) (*models.OauthClient, error) {
	// Fetch the client
	client, err := s.FindClientByClientID(clientID)
	if err != nil {
		return nil, ErrClientNotFound
	}

	// Verify the secret
	if password.VerifyPassword(client.Secret, secret) != nil {
		return nil, ErrInvalidClientSecret
	}

	return client, nil
}

func (s *Service) createClientCommon(db *gorm.DB, clientID, secret, redirectURI string, userID string) (*models.OauthClient, error) {
	// Check client ID
	if s.ClientExists(clientID) {
		return nil, ErrClientIDTaken
	}

	// Hash password
	secretHash, err := password.HashPassword(secret)
	if err != nil {
		return nil, err
	}

	client := &models.OauthClient{
		MyGormModel: models.MyGormModel{
			ID:        uuid.New().String(),
			CreatedAt: time.Now().UTC(),
		},
		Key:         strings.ToLower(clientID),
		Secret:      string(secretHash),
		RedirectURI: util.StringOrNull(redirectURI),
		UserID:      string(userID),
	}
	if err := db.Create(client).Error; err != nil {
		return nil, err
	}
	return client, nil
}
