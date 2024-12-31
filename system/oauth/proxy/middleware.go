package proxy

import (
	"net/http"
)

// parseFormMiddleware parses the form so r.Form becomes available
type parseFormMiddleware struct{}

// ServeHTTP as per the negroni.Handler interface
func (m *parseFormMiddleware) ServeHTTP(w http.ResponseWriter, r *http.Request, next http.HandlerFunc) {
	if err := r.ParseForm(); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	next(w, r)
}

// guestMiddleware just initialises session
type guestMiddleware struct {
	service ServiceInterface
}

// newGuestMiddleware creates a new guestMiddleware instance
func newGuestMiddleware(service ServiceInterface) *guestMiddleware {
	return &guestMiddleware{service: service}
}

// ServeHTTP as per the negroni.Handler interface
func (m *guestMiddleware) ServeHTTP(w http.ResponseWriter, r *http.Request, next http.HandlerFunc) {
	next(w, r)
}
