package job

import (
	"database/sql"

	"localdomain/cron-scheduler/core"
	"localdomain/cron-scheduler/db"
)

// QueryFindPaidApps comment
const QueryFindPaidApps = `
SELECT
	app_name AS appName,
	monthly_price AS monthlyPrice,
	fee_rate AS feeRate,
	_organization_id AS organizationID
FROM subscriptions
WHERE
	_organization_id = ?
	AND monthly_price > 0
;`

// QueryRecordHistoryBillingItem comment
const QueryRecordHistoryBillingItem = `
INSERT IGNORE INTO contermets (
	day, month, year, hour, charge_value, app_name, _organization_id
) VALUES (
	DAYOFMONTH(CURRENT_TIMESTAMP),
	MONTH(CURRENT_TIMESTAMP),
	YEAR(CURRENT_TIMESTAMP),
	HOUR(CURRENT_TIMESTAMP),
	?, ?, ?
)
;`

// Execute comment
func (ctx *CalculateHourlyBilling) Execute(cfg *core.Config, rpd *ReportData) error {
	ctx.cfg = cfg
	ctx.report = rpd

	return ctx.SaveReport()
}

// SaveReport comment
func (ctx *CalculateHourlyBilling) SaveReport() (err error) {
	organizationID := ctx.report.OrganizationID
	memberID := ctx.report.MemberID

	memberDb, err := db.GetMemberDb(ctx.cfg, memberID)
	if err != nil {
		return err
	}

	// // billing for monthly membership subscription
	// var (
	// 	feeRate sql.NullFloat64
	// 	appName sql.NullString
	// )

	// feeRate.Scan(0.0000)
	// appName.Scan("membership")

	// _, err := tx.Exec(
	// 	QueryRecordHistoryBillingItem,
	// 	feeRate,        // ChargeValue
	// 	appName,        // AppName
	// 	organizationID, // OrganizationID
	// )
	// if err != nil {
	// 	return err
	// }

	// billing for third-party applications
	paidAppRows, err := memberDb.
		Raw(QueryFindPaidApps, organizationID).
		Rows()
	if err != nil {
		return err
	}
	defer paidAppRows.Close()

	for paidAppRows.Next() {
		var (
			appName        sql.NullString
			monthlyPrice   sql.NullFloat64
			feeRate        sql.NullFloat64
			organizationID sql.NullString
		)

		err = paidAppRows.Scan(
			&appName,
			&monthlyPrice,
			&feeRate,
			&organizationID,
		)

		if err != nil {
			if err == sql.ErrNoRows {
				feeRate = sql.NullFloat64{Float64: 0.0000, Valid: true}
			} else {
				return err
			}
		}

		return memberDb.
			Exec(
				QueryRecordHistoryBillingItem,
				feeRate,        // ChargeValue
				appName,        // AppName
				organizationID, // OrganizationID
			).
			Error
	}

	return err
}
