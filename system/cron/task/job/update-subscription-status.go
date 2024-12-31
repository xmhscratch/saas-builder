package job

import (
	"database/sql"

	"localdomain/cron-scheduler/core"
	"localdomain/cron-scheduler/db"
)

// QueryCountExceedUsageApps comment
const QueryCountExceedUsageApps = `
SELECT
	subscriptions.app_name,
	SUM(subscription_usages.quota_value > subscription_usages.quota_cap) AS exceeded_usage,
	(TIMESTAMPDIFF(SECOND, subscriptions.created_at, subscriptions.trial_expired_at) >= 0) AS on_trial_period
FROM subscriptions
LEFT JOIN subscription_usages
ON subscriptions.app_name = SUBSTRING_INDEX(subscription_usages.quota_name, '.', 1)
WHERE (subscriptions._organization_id = ?)
GROUP BY subscriptions.app_name
;`

// Execute comment
func (ctx *UpdateSubscriptionStatus) Execute(cfg *core.Config, rpd *ReportData) error {
	ctx.cfg = cfg
	ctx.report = rpd

	return ctx.SaveReport()
}

// SaveReport comment
func (ctx *UpdateSubscriptionStatus) SaveReport() (err error) {
	organizationID := ctx.report.OrganizationID
	memberID := ctx.report.MemberID

	memberDb, err := db.GetMemberDb(ctx.cfg, memberID)
	if err != nil {
		return err
	}

	exceedAppRows, err := memberDb.
		Raw(QueryCountExceedUsageApps, organizationID).
		Rows()
	if err != nil {
		return err
	}
	defer exceedAppRows.Close()

	for exceedAppRows.Next() {
		var (
			appName       sql.NullString
			exceededUsage sql.NullInt64
			onTrialPeriod sql.NullBool
		)

		err = exceedAppRows.Scan(&appName, &exceededUsage, &onTrialPeriod)

		if err != nil {
			continue
		}

		newStatusValue := 1
		if exceededUsage.Int64 > 0 && onTrialPeriod.Bool == false {
			newStatusValue = 3
		}

		err = memberDb.
			Exec(
				QueryUpdateSubscriptionStatus,
				newStatusValue,
				appName,
				organizationID,
			).
			Error
	}

	return err
}
