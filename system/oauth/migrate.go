package main

import (
	"log"

	"localdomain/oauth/core"
	"localdomain/oauth/database"
	"localdomain/oauth/models"
	"localdomain/oauth/util/migrations"
)

// Migrate runs database migrations
func main1() {
	cfg, err := core.NewConfig("")
	if err != nil {
		log.Println(err)
		return
	}

	// Database
	db, err := database.NewDatabase(cfg)
	if err != nil {
		log.Println(err)
		return
	}
	defer db.Close()

	// Bootstrap migrations
	if err := migrations.Bootstrap(db); err != nil {
		log.Println(err)
		return
	}

	// Run migrations for the oauth service
	if err := models.MigrateAll(db); err != nil {
		log.Println(err)
		return
	}
}
