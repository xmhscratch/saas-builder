package models

import (
	null "gopkg.in/guregu/null.v4"
)

type CronTab struct {
	CronName    null.String `gorm:"column:cron_name;type:string;" sql:"type:varchar(100)" json:"cronName"`
	CronSpec    null.String `gorm:"column:cron_spec;type:string;" sql:"type:varchar(100)" json:"cronSpec"`
	TargetModel null.String `gorm:"column:target_model;type:string;" sql:"type:varchar(24)" json:"targetModel"`
	IsEnabled   null.Bool   `gorm:"column:is_enabled;type:bool;" sql:"type:tinyint(1)" json:"isEnabled"`
	Comment     null.String `gorm:"column:comment;type:string;" sql:"type:text" json:"comment"`
}

// TableName specifies table name
func (ctx *CronTab) TableName() string {
	return "crons"
}
