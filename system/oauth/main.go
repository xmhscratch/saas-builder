package main

import (
	"log"
	"reflect"
	"time"

	"localdomain/oauth/core"
	"localdomain/oauth/database"
	"localdomain/oauth/health"
	"localdomain/oauth/oauth"
	"localdomain/oauth/proxy"
	"localdomain/oauth/session"
	"localdomain/oauth/web"

	"github.com/gorilla/mux"
	"github.com/gorilla/sessions"
	"github.com/jinzhu/gorm"
	"github.com/urfave/negroni"
	graceful "gopkg.in/tylerb/graceful.v1"
)

var (
	// OauthService ...
	OauthService oauth.ServiceInterface

	// SessionService ...
	SessionService session.ServiceInterface

	// HealthService ...
	HealthService health.ServiceInterface

	// WebService ...
	WebService web.ServiceInterface

	// ProxyService ...
	ProxyService proxy.ServiceInterface
)

// UseOauthService sets the oAuth service
func UseOauthService(o oauth.ServiceInterface) {
	OauthService = o
}

// UseSessionService sets the session service
func UseSessionService(s session.ServiceInterface) {
	SessionService = s
}

// UseHealthService sets the health service
func UseHealthService(h health.ServiceInterface) {
	HealthService = h
}

// UseWebService sets the web service
func UseWebService(w web.ServiceInterface) {
	WebService = w
}

// UseProxyService sets the proxy service
func UseProxyService(p proxy.ServiceInterface) {
	ProxyService = p
}

func main() {
	cfg, err := core.NewConfig("")
	if err != nil {
		panic(err)
	}

	// Database
	db, err := database.NewDatabase(cfg)
	if err != nil {
		log.Println(err)
		return
	}
	defer db.Close()

	// start the services
	if err := StartAllServices(cfg, db); err != nil {
		log.Println(err)
		return
	}
	defer CloseAllServices()

	// Start a classic negroni app
	app := negroni.New()
	app.Use(negroni.NewRecovery())
	app.Use(negroni.NewLogger())
	// app.Use(negroni.NewStatic(http.Dir("public")))

	// Create a router instance
	router := mux.NewRouter()
	// Add routes
	HealthService.RegisterRoutes(router, "/stat")
	OauthService.RegisterRoutes(router, "/oauth2")
	WebService.RegisterRoutes(router, "/web")
	ProxyService.RegisterRoutes(router, "/v1")

	// Set the router
	app.UseHandler(router)

	// // Run the server on port 8080, gracefully stop on SIGTERM signal
	graceful.Run(":"+cfg.Port, 5*time.Second, app)
}

// StartAllServices starts up all services
func StartAllServices(cfg *core.Config, db *gorm.DB) error {
	if nil == reflect.TypeOf(OauthService) {
		OauthService = oauth.NewService(cfg, db)
	}

	if nil == reflect.TypeOf(SessionService) {
		// redisStore, err := redistore.NewRediStoreWithDB(
		// 	10,
		// 	"tcp",
		// 	"redis_master:6379",
		// 	"",
		// 	"2",
		// 	[]byte(cfg.Session.Secret),
		// )
		// if err != nil {
		// 	log.Println(err)
		// 	return err
		// }
		// defer redisStore.Close()

		// redisStore.SetKeyPrefix("session_")
		// note: default session store is CookieStore
		// SessionService = session.NewService(cfg, redisStore)

		SessionService = session.NewService(cfg, sessions.NewCookieStore([]byte(cfg.Session.Secret)))
	}

	if nil == reflect.TypeOf(HealthService) {
		HealthService = health.NewService(db)
	}

	if nil == reflect.TypeOf(WebService) {
		WebService = web.NewService(cfg, OauthService, SessionService)
	}

	if nil == reflect.TypeOf(ProxyService) {
		ProxyService = proxy.NewService(cfg, OauthService)
	}

	return nil
}

// CloseAllServices closes any open services
func CloseAllServices() {
	OauthService.Close()
	SessionService.Close()
	HealthService.Close()
	WebService.Close()
	ProxyService.Close()
}
