package job

import (
	"database/sql"
	"time"

	"localdomain/cron-scheduler/core"
	"localdomain/cron-scheduler/db"

	"gorm.io/gorm"
)

// QueryRecordInvoiceItem comment
const QueryRecordInvoiceItem = `
INSERT IGNORE INTO invoice_items (
	id, wallet_id, description, quantity,
	sub_total, start_date, end_date, _organization_id
) VALUES (
	?, ?, ?, ?,
	?, ?, ?, ?
);`

// QueryGenerateInvoiceItems comment
const QueryGenerateInvoiceItems = `
SELECT
	CONCAT(subscriptions.app_name, "_", subscriptions.plan_name, "_", contermets.month, "_", contermets.year) AS id,
    CONCAT("app: ", subscriptions.app_name, " - ", "plan: ", subscriptions.plan_name) AS description,
    CONCAT("msp_", contermets.month, "_", contermets.year) AS walletId,
    COUNT(*) AS quantity,
	SUM(COALESCE(contermets.charge_value, 0.0000)) AS subTotal,
	MIN(STR_TO_DATE(CONCAT(contermets.month, "/", contermets.day, "/", contermets.year), "%m/%d/%Y")) AS startDate,
    MAX(STR_TO_DATE(CONCAT(contermets.month, "/", contermets.day, "/", contermets.year), "%m/%d/%Y")) AS endDate
FROM contermets
LEFT JOIN subscriptions ON (
	contermets._organization_id = subscriptions._organization_id
    AND contermets.app_name = subscriptions.app_name
)
WHERE
	contermets.month = MONTH(CURRENT_TIMESTAMP - INTERVAL 1 MONTH)
	AND contermets.year = YEAR(CURRENT_TIMESTAMP - INTERVAL 1 MONTH)
	AND contermets._organization_id = ?
;`

// InvoiceItem comment
type InvoiceItem struct {
	ID             string     `json:"id"`
	WalletID       string     `json:"walletId"`
	Description    string     `json:"description"`
	Quantity       int64      `json:"quantity"`
	SubTotal       float64    `json:"subTotal"`
	StartDate      *time.Time `json:"startDate"`
	EndDate        *time.Time `json:"endDate"`
	OrganizationID string     `json:"organizationId"`
}

// Execute comment
func (ctx *IssueMonthlyInvoiceItems) Execute(cfg *core.Config, rpd *ReportData) error {
	ctx.cfg = cfg
	ctx.report = rpd

	return ctx.SaveReport()
}

// SaveReport comment
func (ctx *IssueMonthlyInvoiceItems) SaveReport() (err error) {
	organizationID := ctx.report.OrganizationID
	memberID := ctx.report.MemberID

	memberDb, err := db.GetMemberDb(ctx.cfg, memberID)
	if err != nil {
		return err
	}

	items, err := ctx.fetchInvoiceItems(memberDb, organizationID)
	if err != nil {
		return err
	}

	for _, item := range items {
		err := memberDb.
			Exec(
				QueryRecordInvoiceItem,
				item.ID,
				item.WalletID,
				item.Description,
				item.Quantity,
				item.SubTotal,
				item.StartDate,
				item.EndDate,
				item.OrganizationID,
			).
			Error

		if err != nil {
			return err
		}
	}

	return err
}

// fetchInvoiceItems comment
func (ctx *IssueMonthlyInvoiceItems) fetchInvoiceItems(memberDb *gorm.DB, organizationID string) (items []*InvoiceItem, err error) {
	rows, err := memberDb.
		Raw(QueryGenerateInvoiceItems, organizationID).
		Rows()
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	for rows.Next() {
		var (
			ID          sql.NullString
			walletID    sql.NullString
			description sql.NullString
			quantity    sql.NullInt64
			subTotal    sql.NullFloat64
			startDate   *time.Time
			endDate     *time.Time
		)

		err := rows.Scan(
			&ID,
			&walletID,
			&description,
			&quantity,
			&subTotal,
			&startDate,
			&endDate,
		)

		if err != nil {
			return nil, err
		}

		if ID.String == "" || quantity.Int64 == 0 {
			continue
		}

		items = append(items, &InvoiceItem{
			ID:             ID.String,
			WalletID:       walletID.String,
			Description:    description.String,
			Quantity:       quantity.Int64,
			SubTotal:       subTotal.Float64,
			StartDate:      startDate,
			EndDate:        endDate,
			OrganizationID: organizationID,
		})
	}

	return items, err
}
