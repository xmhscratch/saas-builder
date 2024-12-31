package database

import (
	"fmt"
	"time"

	"localdomain/oauth/core"
	// mysql driver
	_ "github.com/go-sql-driver/mysql"
	"github.com/jinzhu/gorm"
)

func init() {
	gorm.NowFunc = func() time.Time {
		return time.Now().UTC()
	}
}

// NewDatabase returns a gorm.DB struct, gorm.DB.DB() returns a database handle
// see http://golang.org/pkg/database/sql/#DB
func NewDatabase(cfg *core.Config) (*gorm.DB, error) {
	// Connection args
	args := fmt.Sprintf(
		"%s:%s@tcp(%s:%d)/%s?charset=utf8&parseTime=True&loc=Local",
		cfg.Database.User,
		cfg.Database.Password,
		cfg.Database.Host,
		cfg.Database.Port,
		cfg.Database.DatabaseName,
	)

	db, err := gorm.Open(cfg.Database.Type, args)
	if err != nil {
		return db, err
	}

	// Max idle connections
	db.DB().SetMaxIdleConns(cfg.Database.MaxIdleConns)

	// Max open connections
	db.DB().SetMaxOpenConns(cfg.Database.MaxOpenConns)

	// Database logging
	db.LogMode(cfg.Debug)

	return db, nil
}
