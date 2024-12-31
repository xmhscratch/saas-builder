package session

import (
	"net/http"

	"github.com/gorilla/sessions"
)

// ServiceInterface defines exported methods
type ServiceInterface interface {
	SetSessionService(r *http.Request, w http.ResponseWriter)
	StartSession() error
	GetSession() (*sessions.Session, error)
	GetUserSession() (*UserSession, error)
	SetUserSession(userSession *UserSession) error
	ClearUserSession() error
	SetFlashMessage(msg string) error
	GetFlashMessage() (interface{}, error)
	Close()
}
