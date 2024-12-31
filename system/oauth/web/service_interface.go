package web

import (
	"net/http"

	"localdomain/oauth/core"
	"localdomain/oauth
	"localdomain/oauth
	"localdomain/oauthtes"
	"github.com/gorilla/mux"
)

// ServiceInterface defines exported methods
type ServiceInterface interface {
	// Exported methods
	GetConfig() *core.Config
	GetOauthService() oauth.ServiceInterface
	GetSessionService() session.ServiceInterface
	GetRoutes() []routes.Route
	RegisterRoutes(router *mux.Router, prefix string)
	Close()

	// Needed for the newRoutes to be able to register handlers
	setSessionService(r *http.Request, w http.ResponseWriter)
	authTokens(w http.ResponseWriter, r *http.Request)
	clearSession(w http.ResponseWriter, r *http.Request)
	syncSession(w http.ResponseWriter, r *http.Request)
	authorizeForm(w http.ResponseWriter, r *http.Request)
	authorize(w http.ResponseWriter, r *http.Request)
}
