package job

import (
	"database/sql"
	"strings"
	"time"

	"localdomain/cron-scheduler/core"
	"localdomain/cron-scheduler/db"
)

// QueryFindNewPaymentItems comment
const QueryFindNewPaymentItems = `
SELECT
	id AS paymentID,
	reserved_code AS reservedCode,
	_organization_id AS organizationID,
	method AS method,
	coupon_code AS couponCode,
	discount_amount AS discountAmount,
	discount_canceled AS discountCanceled,
	discount_invoiced AS discountInvoiced,
	discount_refunded AS discountRefunded,
	grand_total AS grandTotal,
	total_canceled AS totalCanceled,
	total_invoiced AS totalInvoiced,
	total_paid AS totalPaid,
	total_refunded AS totalRefunded,
	adjustment_negative AS adjustmentNegative,
	adjustment_positive AS adjustmentPositive,
	global_currency_code AS globalCurrencyCode,
	created_at AS createdAt,
	updated_at AS updatedAt,
	status AS status
FROM payments
WHERE
	status = "processing"
	AND _organization_id = ?
;`

// QueryRecordWalletIncome comment
const QueryRecordWalletIncome = `
INSERT IGNORE INTO wallets (
	id,
	description,
	created_at,
	balance_income, balance_outcome,
	_organization_id
) VALUES (
	CONCAT("pyi", "_", ?, "_", ?),
	?,
	CURRENT_TIMESTAMP,
	?, 0,
	?
);`

// QueryUpdatePaymentStatus comment
const QueryUpdatePaymentStatus = `
UPDATE payments
SET status = ?
WHERE id = ? AND _organization_id = ?;`

// PaymentItem comment
type PaymentItem struct {
	ID             string  `json:"id"`
	ReservedCode   string  `json:"reservedCode"`
	Description    string  `json:"description"`
	BalanceIncome  float64 `json:"balance_income"`
	BalanceOutcome float64 `json:"balance_outcome"`
	Items          string  `json:"items"`
	OrganizationID string  `json:"_organization_id"`
}

// Execute comment
func (ctx *ProcessNewPayment) Execute(cfg *core.Config, rpd *ReportData) error {
	ctx.cfg = cfg
	ctx.report = rpd

	return ctx.SaveReport()
}

// SaveReport comment
func (ctx *ProcessNewPayment) SaveReport() (err error) {
	organizationID := ctx.report.OrganizationID
	memberID := ctx.report.MemberID

	memberDb, err := db.GetMemberDb(ctx.cfg, memberID)
	if err != nil {
		return err
	}

	itemRows, err := memberDb.
		Raw(QueryFindNewPaymentItems, organizationID).
		Rows()

	if err != nil {
		return err
	}
	defer itemRows.Close()

	for itemRows.Next() {
		var (
			paymentID          string
			reservedCode       string
			organizationID     string
			method             string
			couponCode         sql.NullString
			discountAmount     float64
			discountCanceled   float64
			discountInvoiced   float64
			discountRefunded   float64
			grandTotal         float64
			totalCanceled      float64
			totalInvoiced      float64
			totalPaid          float64
			totalRefunded      float64
			adjustmentNegative float64
			adjustmentPositive float64
			globalCurrencyCode string
			createdAt          *time.Time
			updatedAt          *time.Time
			status             string
		)

		err = itemRows.Scan(
			&paymentID,
			&reservedCode,
			&organizationID,
			&method,
			&couponCode,
			&discountAmount,
			&discountCanceled,
			&discountInvoiced,
			&discountRefunded,
			&grandTotal,
			&totalCanceled,
			&totalInvoiced,
			&totalPaid,
			&totalRefunded,
			&adjustmentNegative,
			&adjustmentPositive,
			&globalCurrencyCode,
			&createdAt,
			&updatedAt,
			&status,
		)
		if err != nil {
			return err
		}

		item := &PaymentItem{
			ID:             paymentID,
			ReservedCode:   reservedCode,
			Description:    strings.Title(method),
			BalanceIncome:  grandTotal,
			BalanceOutcome: 0.0000,
			OrganizationID: organizationID,
		}

		if err := ctx.RecordWalletIncome(item); err != nil {
			return err
		}

		if err := ctx.UpdatePaymentItemStatus(item); err == nil {
			return err
		}

		if err := ctx.ActivateSuspendedSubscription(); err == nil {
			return err
		}
	}

	return err
}

// RecordWalletIncome comment
func (ctx *ProcessNewPayment) RecordWalletIncome(item *PaymentItem) (err error) {
	memberID := ctx.report.MemberID

	memberDb, err := db.GetMemberDb(ctx.cfg, memberID)
	if err != nil {
		return err
	}

	return memberDb.
		Exec(
			QueryRecordWalletIncome,
			item.ID,
			item.ReservedCode,
			item.Description,
			item.BalanceIncome,
			item.OrganizationID,
		).
		Error
}

// UpdatePaymentItemStatus comment
func (ctx *ProcessNewPayment) UpdatePaymentItemStatus(item *PaymentItem) (err error) {
	memberID := ctx.report.MemberID

	memberDb, err := db.GetMemberDb(ctx.cfg, memberID)
	if err != nil {
		return err
	}

	return memberDb.
		Exec(
			QueryUpdatePaymentStatus,
			"complete",
			item.ID,
			item.OrganizationID,
		).
		Error
}

// ActivateSuspendedSubscription comment
func (ctx *ProcessNewPayment) ActivateSuspendedSubscription() (err error) {
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
			appName        string
			organizationID string
		)

		err = paidAppRows.Scan(&appName, &organizationID)
		if err != nil {
			return err
		}

		err = memberDb.
			Exec(
				QueryUpdateSubscriptionStatus,
				StatusSubscriptionActivated,
				appName,
				organizationID,
			).
			Error
	}

	return err
}
