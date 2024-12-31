package db

import (
	"localdomain/cron-scheduler/core"

	"gorm.io/gorm"
)

// GetMainDb comment
func GetMainDb(cfg *core.Config) (mainDb *gorm.DB, err error) {
	if mainDb, err = core.NewDatabase(cfg, "system_core"); err != nil {
		return mainDb, err
	}
	return mainDb, err
}

// GetMemberDb comment
func GetMemberDb(cfg *core.Config, memberID string) (memberDb *gorm.DB, err error) {
	dbName := core.BuildString("system_core", "_", memberID)
	if memberDb, err = core.NewDatabase(cfg, dbName); err != nil {
		return memberDb, err
	}
	return memberDb, err
}
