package task

import (
	"reflect"

	"localdomain/cron-scheduler/task/job"
)

// List comment
type List map[string]reflect.Value

// ReportFunctionList comment
var ReportFunctionList = map[string]interface{}{
	"Noop":                      (&job.Noop{}).Execute,
	"AckAchievement":            (&job.AckAchievement{}).Execute,
	"AckAchievementFulfillment": (&job.AckAchievementFulfillment{}).Execute,
	"CalculateHourlyBilling":    (&job.CalculateHourlyBilling{}).Execute,
	"CleanBillingHistory":       (&job.CleanBillingHistory{}).Execute,
	"CleanDeletedPhoto":         (&job.CleanDeletedPhoto{}).Execute,
	"CleanGarbagePhoto":         (&job.CleanGarbagePhoto{}).Execute,
	"DeliverGift":               (&job.DeliverGift{}).Execute,
	"DowngradeNonPayment":       (&job.DowngradeNonPayment{}).Execute,
	"IssueMonthlyInvoice":       (&job.IssueMonthlyInvoice{}).Execute,
	"IssueMonthlyInvoiceItems":  (&job.IssueMonthlyInvoiceItems{}).Execute,
	"ProcessNewPayment":         (&job.ProcessNewPayment{}).Execute,
	"SyncCustomerUsage":         (&job.SyncCustomerUsage{}).Execute,
	"SyncCustomerData":          (&job.SyncCustomerData{}).Execute,
	"UpdateSubscriptionStatus":  (&job.UpdateSubscriptionStatus{}).Execute,
}
