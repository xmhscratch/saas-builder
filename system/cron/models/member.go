package models

import (
	null "gopkg.in/guregu/null.v4"
)

type Member struct {
	ID        null.String `gorm:"column:id;type:string;" sql:"type:char(36)" json:"id"`
	CreatedAt null.Time   `gorm:"->:false;<-:create;column:created_at;not null;default:current_timestamp();type:time;" sql:"type:datetime;" json:"createdAt"`
	UpdatedAt null.Time   `gorm:"column:updated_at;type:time;" sql:"type:datetime" json:"updatedAt"`
}

// TableName specifies table name
func (ctx *Member) TableName() string {
	return "_members"
}
