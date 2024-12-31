package web

import (
	"encoding/json"
	"log"
	"net/http"
	"net/url"
)

func (s *Service) authTokens(w http.ResponseWriter, r *http.Request) {
	sessionID := r.Form.Get("_ssid")
	_, err := syncUserSession(sessionID, s, r)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Get the session service from the request context
	sessionService, err := getSessionService(r)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	userSession, err := sessionService.GetUserSession()
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	if userSession == nil {
		sessionID := r.Form.Get("_ssid")
		userSession, err = syncUserSession(sessionID, s, r)
		if err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}
	}

	w.Header().Set("Content-Type", "application/json")
	respBody, err := json.Marshal(userSession)

	w.Write(respBody)
}

func (s *Service) clearSession(w http.ResponseWriter, r *http.Request) {
	cfg := s.GetConfig()

	continueURL, err := url.Parse(r.Form.Get("_continue"))
	if err != nil {
		continueURL, _ = url.Parse(cfg.DashboardURL)
	}

	query := r.URL.Query()
	delete(query, "_continue")
	delete(query, "_ssid")
	queryString := query.Encode()
	if queryString != "" {
		queryString = buildString("?", queryString)
	}

	defer func() {
		http.Redirect(w, r, buildString(continueURL.String(), queryString), http.StatusMovedPermanently)
	}()

	_ = clearUserSession(s, r)
	// if err != nil {
	// 	http.Error(w, err.Error(), http.StatusBadRequest)
	// }
}

func (s *Service) syncSession(w http.ResponseWriter, r *http.Request) {
	cfg := s.GetConfig()

	sessionID := r.Form.Get("_ssid")

	continueURL, err := url.Parse(r.Form.Get("_continue"))
	if err != nil {
		continueURL, _ = url.Parse(cfg.DashboardURL)
	}

	query := r.URL.Query()
	delete(query, "_continue")
	delete(query, "_callback")
	delete(query, "_ssid")
	query.Set("_s", "1")
	if r.Form.Get("_callback") != "" {
		query.Set("_continue", r.Form.Get("_callback"))
	}
	queryString := query.Encode()
	if queryString != "" {
		queryString = buildString("?", queryString)
	}

	defer func() {
		log.Println(continueURL.String() + queryString)
		http.Redirect(w, r, buildString(continueURL.String(), queryString), http.StatusMovedPermanently)
	}()

	_, err = syncUserSession(sessionID, s, r)
	if err != nil {
		err = clearUserSession(s, r)
		_, err = syncUserSession(sessionID, s, r)
	}
}
