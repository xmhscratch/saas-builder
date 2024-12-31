package db

import (
	"bytes"
	"database/sql" // mysql driver
	"log"

	"localdomain/cron-scheduler/core"

	_ "github.com/go-sql-driver/mysql"
	"github.com/ztrue/tracerr"
)

type Db struct {
	cfg        *core.Config
	Connection *sql.DB
}

// CreateDb comment
func CreateDb(cfg *core.Config, dbName string) (ctx *Db, err error) {
	ctx = &Db{cfg: cfg}

	var connString bytes.Buffer
	connString.WriteString(cfg.MySQLConnectionString)
	connString.WriteString(dbName)
	connString.WriteString("?parseTime=true")

	ctx.Connection, err = sql.Open("mysql", connString.String())
	if err != nil {
		return ctx, err
	}
	// defer ctx.Connection.Close()

	if err = ctx.Connection.Ping(); err != nil {
		ctx.Dispose()
		return ctx, err
	}

	return ctx, err
}

// Transact comment
func Transact(db *sql.DB, txFunc func(*sql.Tx) error) (err error) {
	tx, err := db.Begin()
	if err != nil {
		return err
	}
	defer func() {
		if p := recover(); p != nil {
			tx.Rollback()
			log.Println(tracerr.Wrap(err))
			panic(p) // re-throw panic after Rollback
		} else if err != nil {
			log.Println(tracerr.Wrap(err))
			tx.Rollback() // err is non-nil; don't change it
		} else {
			err = tx.Commit() // err is nil; if Commit returns error update err
			if err != nil {
				log.Println(tracerr.Wrap(err))
			}
		}
	}()
	err = txFunc(tx)
	if err != nil {
		log.Println(tracerr.Wrap(err))
	}
	return err
}

// Dispose comment
func (ctx *Db) Dispose() {
	if ctx.Connection != nil {
		defer ctx.Connection.Close()
	}
}
