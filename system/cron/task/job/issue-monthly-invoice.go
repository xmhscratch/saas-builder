package job

import (
	"database/sql"

	"localdomain/cron-scheduler/core"
	"localdomain/cron-scheduler/db"
)

// QueryGetTotalCharged comment
const QueryGetTotalCharged = `
SELECT
	IFNULL(SUM(sub_total), 0.0000) AS totalChargeValue
FROM invoice_items
WHERE MONTH(end_date) = MONTH(CURRENT_TIMESTAMP - INTERVAL 1 MONTH)
	AND YEAR(end_date) = YEAR(CURRENT_TIMESTAMP - INTERVAL 1 MONTH)
	AND _organization_id = ?
LIMIT 1;
`

// QueryRecordMoneyCharged comment
const QueryRecordMoneyCharged = `
INSERT IGNORE INTO wallets (
	id,
	description,
	created_at,
	balance_income, balance_outcome,
	_organization_id
) VALUES (
	CONCAT("msp", "_", MONTH(CURRENT_TIMESTAMP - INTERVAL 1 MONTH), "_", YEAR(CURRENT_TIMESTAMP - INTERVAL 1 MONTH)),
	CONCAT("Invoice for ", MONTHNAME(CURRENT_TIMESTAMP - INTERVAL 1 MONTH), " ", YEAR(CURRENT_TIMESTAMP - INTERVAL 1 MONTH)),
	CURRENT_TIMESTAMP,
	0.0000, ?,
	?
);`

// Execute comment
func (ctx *IssueMonthlyInvoice) Execute(cfg *core.Config, rpd *ReportData) error {
	ctx.cfg = cfg
	ctx.report = rpd

	return ctx.SaveReport()
}

// SaveReport comment
func (ctx *IssueMonthlyInvoice) SaveReport() (err error) {
	var totalChargeValue sql.NullFloat64

	organizationID := ctx.report.OrganizationID
	memberID := ctx.report.MemberID

	memberDb, err := db.GetMemberDb(ctx.cfg, memberID)
	if err != nil {
		return err
	}

	err = memberDb.
		Raw(QueryGetTotalCharged, organizationID).
		Scan(&totalChargeValue).
		Error

	if err == sql.ErrNoRows {
		totalChargeValue = sql.NullFloat64{Float64: 0.0000, Valid: true}
	}

	if err != nil {
		return err
	}

	return memberDb.
		Exec(
			QueryRecordMoneyCharged,
			totalChargeValue.Float64, // BalanceOutcome
			organizationID,           // OrganizationID
		).
		Error
}
