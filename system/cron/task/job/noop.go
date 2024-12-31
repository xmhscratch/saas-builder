package job

import (
	// "encoding/json"
	"log"

	"localdomain/cron-scheduler/core"
)

// Execute comment
func (ctx *Noop) Execute(cfg *core.Config, rpd *ReportData) error {
	ctx.cfg = cfg
	ctx.report = rpd

	return nil
	// return ctx.SaveReport()
}

// SaveReport comment
func (ctx *Noop) SaveReport() (err error) {
	log.Println("No-OP")

	return err
}
