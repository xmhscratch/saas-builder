package models

import (
	"time"
)

// MyGormModel mimixks GormModel but uses uuid's for ID, generated in go
type MyGormModel struct {
	ID        string     `gorm:"primary_key"`
	CreatedAt time.Time  `gorm:"->:false;<-:create;column:created_at;not null;default:current_timestamp();type:time;" sql:"type:datetime;" json:"createdAt"`
	UpdatedAt time.Time  `gorm:"column:updated_at;type:time;" sql:"type:datetime" json:"updatedAt,ommitempty"`
	DeletedAt *time.Time `gorm:"column:deleted_at;type:time;" sql:"type:datetime" json:"deletedAt,ommitempty"`
}

// TimestampModel ...
type TimestampModel struct {
	CreatedAt time.Time  `gorm:"->:false;<-:create;column:created_at;not null;default:current_timestamp();type:time;" sql:"type:datetime;" json:"createdAt"`
	UpdatedAt time.Time  `gorm:"column:updated_at;type:time;" sql:"type:datetime" json:"updatedAt,ommitempty"`
	DeletedAt *time.Time `gorm:"column:deleted_at;type:time;" sql:"type:datetime" json:"deletedAt,ommitempty"`
}

// EmailTokenModel is an abstract model which can be used for objects from which
// we derive redirect emails (email confirmation, password reset and such)
type EmailTokenModel struct {
	MyGormModel
	Reference   string `sql:"type:varchar(40);unique;not null"`
	EmailSent   bool   `sql:"index;not null"`
	EmailSentAt *time.Time
	ExpiresAt   time.Time `sql:"index;not null"`
}
