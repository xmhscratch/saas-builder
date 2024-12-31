package job

import (
	"localdomain/cron-scheduler/core"
	"localdomain/cron-scheduler/db"
)

// QueryFindPaidAppsWithCredit comment
const QueryFindPaidAppsWithCredit = `
SELECT
	app_installed.app_name AS appName,
	app_installed._organization_id AS organizationID,
    subscriptions.monthly_price AS monthlyPrice,
    remainingCredit
FROM app_installed
LEFT JOIN subscriptions ON subscriptions.app_name = app_installed.app_name
INNER JOIN (
	SELECT
        SUM(COALESCE(balance_income, 0.0000) - COALESCE(balance_outcome, 0.0000)) AS remainingCredit
    FROM wallets
) AS remainingCredit
WHERE app_installed._organization_id = ?
GROUP BY app_installed.app_name
HAVING monthlyPrice > 0 AND remainingCredit > 0
;`

// QueryUpdateSubscriptionStatus comment
const QueryUpdateSubscriptionStatus = `
UPDATE subscriptions
SET status = ?
WHERE (app_name = ?)
	AND (_organization_id = ?)
;`

// Execute comment
func (ctx *DowngradeNonPayment) Execute(cfg *core.Config, rpd *ReportData) error {
	ctx.cfg = cfg
	ctx.report = rpd

	return nil
	// return ctx.SaveReport()
}

// SaveReport comment
func (ctx *DowngradeNonPayment) SaveReport() (err error) {
	organizationID := ctx.report.OrganizationID
	memberID := ctx.report.MemberID

	memberDb, err := db.GetMemberDb(ctx.cfg, memberID)
	if err != nil {
		return err
	}

	paidAppRows, err := memberDb.
		Raw(QueryFindPaidAppsWithCredit, organizationID).
		Rows()
	if err != nil {
		return err
	}
	defer paidAppRows.Close()

	for paidAppRows.Next() {
		var (
			appName         string
			organizationID  string
			monthlyPrice    string
			remainingCredit string
		)

		err := paidAppRows.Scan(
			&appName,
			&organizationID,
			&monthlyPrice,
			&remainingCredit,
		)
		if err != nil {
			return err
		}

		if err = memberDb.
			Exec(
				QueryUpdateSubscriptionStatus,
				StatusSubscriptionUpgrade,
				appName,
				organizationID,
			).
			Error; err != nil {
			return err
		}
		return err
	}

	return err
}
