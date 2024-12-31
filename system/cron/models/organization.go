package models

import (
	null "gopkg.in/guregu/null.v4"
)

type Organization struct {
	ID          null.String `gorm:"column:id;type:string;" sql:"type:char(36)" json:"id"`
	BusinessID  null.String `gorm:"column:business_id;type:string;" sql:"type:varchar(255)" json:"businessId"`
	Title       null.String `gorm:"column:title;type:string;" sql:"type:varchar(255)" json:"title"`
	Description null.String `gorm:"column:description;type:string;" sql:"type:varchar(512)" json:"description"`
	IsVerified  null.String `gorm:"column:is_verified;type:bool;" sql:"type:tinyint(1)" json:"isVerified"`
	OwnerID     null.String `gorm:"column:owner_id;type:string;" sql:"type:char(36)" json:"ownerId"`
	MemberID    null.String `gorm:"column:_member_id;type:string;" sql:"type:char(6)" json:"memberId"`
	CreatedAt   null.Time   `gorm:"->:false;<-:create;column:created_at;not null;default:current_timestamp();type:time;" sql:"type:datetime;" json:"createdAt"`
	UpdatedAt   null.Time   `gorm:"column:updated_at;type:time;" sql:"type:datetime" json:"updatedAt"`
	DeletedAt   null.Time   `gorm:"column:deleted_at;type:time;" sql:"type:datetime" json:"deletedAt"`
}

// TableName specifies table name
func (ctx *Organization) TableName() string {
	return "organizations"
}
