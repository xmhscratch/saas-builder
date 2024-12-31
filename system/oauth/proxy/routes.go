package proxy

import (
	"localdomain/oauth/util/routes"

	"github.com/gorilla/mux"
	"github.com/urfave/negroni"
)

// RegisterRoutes registers route handlers for the health service
func (s *Service) RegisterRoutes(router *mux.Router, prefix string) {
	subRouter := router.PathPrefix(prefix).Subrouter()
	routes.AddRoutes(s.GetRoutes(), subRouter)
}

// GetRoutes returns []routes.Route slice for the health service
func (s *Service) GetRoutes() []routes.Route {
	return []routes.Route{
		{
			Name:        "proxy_pesponse",
			Method:      "HEAD",
			Pattern:     "/{url:.*}",
			HandlerFunc: s.proxyResponse,
			Middlewares: []negroni.Handler{
				new(parseFormMiddleware),
				newGuestMiddleware(s),
				// newClientMiddleware(s),
			},
		},
		{
			Name:        "proxy_pesponse",
			Method:      "GET",
			Pattern:     "/{url:.*}",
			HandlerFunc: s.proxyResponse,
			Middlewares: []negroni.Handler{
				new(parseFormMiddleware),
				newGuestMiddleware(s),
				// newClientMiddleware(s),
			},
		},
		{
			Name:        "proxy_pesponse",
			Method:      "POST",
			Pattern:     "/{url:.*}",
			HandlerFunc: s.proxyResponse,
			Middlewares: []negroni.Handler{
				new(parseFormMiddleware),
				newGuestMiddleware(s),
				// newClientMiddleware(s),
			},
		},
		{
			Name:        "proxy_pesponse",
			Method:      "PUT",
			Pattern:     "/{url:.*}",
			HandlerFunc: s.proxyResponse,
			Middlewares: []negroni.Handler{
				new(parseFormMiddleware),
				newGuestMiddleware(s),
				// newClientMiddleware(s),
			},
		},
		{
			Name:        "proxy_pesponse",
			Method:      "PATCH",
			Pattern:     "/{url:.*}",
			HandlerFunc: s.proxyResponse,
			Middlewares: []negroni.Handler{
				new(parseFormMiddleware),
				newGuestMiddleware(s),
				// newClientMiddleware(s),
			},
		},
		{
			Name:        "proxy_pesponse",
			Method:      "DELETE",
			Pattern:     "/{url:.*}",
			HandlerFunc: s.proxyResponse,
			Middlewares: []negroni.Handler{
				new(parseFormMiddleware),
				newGuestMiddleware(s),
				// newClientMiddleware(s),
			},
		},
	}
}
