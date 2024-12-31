package job

import (
	"localdomain/cron-scheduler/core"
)

// TenantCapacityLimit comment
const TenantCapacityLimit int64 = 1000

// RestockTenancyItemCount comment
const RestockTenancyItemCount int64 = 10

// TenantCapacityUpkeepThreshold comment
const TenantCapacityUpkeepThreshold int64 = 10000

// StatusSubscriptionActivated comment
const StatusSubscriptionActivated = 1

// StatusSubscriptionSuspended comment
const StatusSubscriptionSuspended = 2

// StatusSubscriptionUpgrade comment
const StatusSubscriptionUpgrade = 3

// InterfaceJob comment
type InterfaceJob interface {
	Execute() error
}

// AbstractJob comment
type AbstractJob struct {
	InterfaceJob
	cfg    *core.Config
	report *ReportData
}

// ReportData comment
type ReportData struct {
	Name           string `json:"name"`
	MemberID       string `json:"member_id"`
	UserID         string `json:"user_id"`
	OrganizationID string `json:"organization_id"`
	// Config            *core.Config
	// Webhook             *core.WebhookPublisher
}

// Noop comment
type Noop struct {
	AbstractJob
}

// ProcessNewPayment comment
type ProcessNewPayment struct {
	AbstractJob
}

// CalculateHourlyBilling comment
type CalculateHourlyBilling struct {
	AbstractJob
}

// IssueMonthlyInvoiceItems comment
type IssueMonthlyInvoiceItems struct {
	AbstractJob
}

// IssueMonthlyInvoice comment
type IssueMonthlyInvoice struct {
	AbstractJob
}

// CleanBillingHistory comment
type CleanBillingHistory struct {
	AbstractJob
}

// CleanDeletedPhoto comment
type CleanDeletedPhoto struct {
	AbstractJob
}

// CleanGarbagePhoto comment
type CleanGarbagePhoto struct {
	AbstractJob
}

// SyncCustomerUsage comment
type SyncCustomerUsage struct {
	AbstractJob
}

// SyncCustomerData comment
type SyncCustomerData struct {
	AbstractJob
}

// DowngradeNonPayment comment
type DowngradeNonPayment struct {
	AbstractJob
}

// ScaleTenancy comment
type ScaleTenancy struct {
	AbstractJob
}

// UpdateSubscriptionStatus comment
type UpdateSubscriptionStatus struct {
	AbstractJob
}

// AckAchievement comment
type AckAchievement struct {
	AbstractJob
}

// AckAchievementFulfillment comment
type AckAchievementFulfillment struct {
	AbstractJob
}

// DeliverGift comment
type DeliverGift struct {
	AbstractJob
	Webhook *core.WebhookPublisher
}
