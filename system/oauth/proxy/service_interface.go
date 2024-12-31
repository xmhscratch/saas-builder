package proxy

import (
	"net/http"

	"localdomain/oauth/core"
	"localdomain/oauth
	"localdomain/oauthtes"
	"github.com/gorilla/mux"
)

// ServiceInterface defines exported methods
type ServiceInterface interface {
	// Exported methods
	GetConfig() *core.Config
	GetOauthService() oauth.ServiceInterface
	GetRoutes() []routes.Route
	RegisterRoutes(router *mux.Router, prefix string)
	Close()

	// Needed for the newRoutes to be able to register handlers
	proxyResponse(w http.ResponseWriter, r *http.Request)
}
