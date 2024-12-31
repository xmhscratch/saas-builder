package proxy

import (
	"bytes"
	"net/http"
	"net/http/httputil"
	"net/url"
	"strings"

	// "log"

	"localdomain/oauth/core"

	"github.com/gorilla/mux"
)

func (s *Service) proxyResponse(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "text/html")

	token := r.Header.Get("Authorization")
	if token == "" {
		w.Header().Set("Content-Type", "text/html")
		w.Write([]byte("access denied"))
		return
	}
	token = strings.TrimSpace(token[len("Bearer "):])

	// Authenticate the user
	accessToken, err := s.oauthService.Authenticate(token)
	if err != nil {
		w.Header().Set("Content-Type", "text/html")
		w.Write([]byte(err.Error()))
		return
	}

	if accessToken == nil {
		w.Header().Set("Content-Type", "text/html")
		w.Write([]byte("access denied"))
		return
	}

	var appName string

	clusterHostName := strings.TrimSpace(r.Host)
	hostFrags := strings.Split(clusterHostName, ".")
	if len(hostFrags) == 3 {
		appName = hostFrags[0]
	} else {
		w.Header().Set("Content-Type", "text/html")
		w.Write([]byte("app not found"))
		return
	}

	var urlBuilder bytes.Buffer

	urlBuilder.WriteString("http://")
	urlBuilder.WriteString(s.cfg.Domains[appName])
	urlBuilder.WriteString("/")

	vars := mux.Vars(r)
	urlBuilder.WriteString(vars["url"])

	if r.URL.RawQuery != "" {
		urlBuilder.WriteString("?")
		urlBuilder.WriteString(r.URL.RawQuery)
	}

	// log.Println(urlBuilder.String())
	urlString, err := core.NormalizeRawURLString(urlBuilder.String())
	if err != nil {
		w.Header().Set("Content-Type", "text/html")
		w.Write([]byte(err.Error()))
		return
	}
	// log.Println(urlString)
	url, _ := url.Parse(urlString)

	// create the reverse proxy
	proxy := httputil.NewSingleHostReverseProxy(url)
	proxy.Director = func(pReq *http.Request) {
		pReq.URL.Scheme = url.Scheme
		pReq.URL.Host = url.Host
		pReq.URL.Path = url.Path
		pReq.URL.RawQuery = r.URL.RawQuery
	}

	// Update the headers to allow for SSL redirection
	r.URL.Scheme = url.Scheme
	r.URL.Host = url.Host
	r.URL.Path = url.Path
	r.URL.RawQuery = url.RawQuery

	r.Host = url.Host

	// Note that ServeHttp is non blocking and uses a go routine under the hood
	proxy.ServeHTTP(w, r)
}
