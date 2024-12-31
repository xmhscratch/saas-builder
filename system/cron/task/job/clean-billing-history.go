package job

import (
	"localdomain/cron-scheduler/core"
	"localdomain/cron-scheduler/db"
)

// QueryDeleteOldHistoryBillingItems comment
const QueryDeleteOldHistoryBillingItems = `
DELETE FROM contermets
WHERE UNIX_TIMESTAMP(STR_TO_DATE(CONCAT(month, "/", day, "/", year), "%m/%d/%Y")) < UNIX_TIMESTAMP(DATE_SUB(CURRENT_TIMESTAMP, INTERVAL 60 DAY))
;`

// Execute comment
func (ctx *CleanBillingHistory) Execute(cfg *core.Config, rpd *ReportData) error {
	ctx.cfg = cfg
	ctx.report = rpd

	return ctx.SaveReport()
}

// SaveReport comment
func (ctx *CleanBillingHistory) SaveReport() (err error) {
	memberID := ctx.report.MemberID

	memberDb, err := db.GetMemberDb(ctx.cfg, memberID)
	if err != nil {
		return err
	}
	return memberDb.Exec(QueryDeleteOldHistoryBillingItems).Error
}
