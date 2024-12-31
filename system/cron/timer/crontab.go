package timer

import (
	"encoding/json"

	"localdomain/cron-scheduler/core"
	"localdomain/cron-scheduler/db"
	"localdomain/cron-scheduler/models"
	"localdomain/cron-scheduler/task/job"

	"github.com/robfig/cron"
	"gorm.io/gorm"
)

// NewCronTab comment
func NewCronTab(cfg *core.Config, cronNames []string) (*CronTab, error) {
	msq := NewPublisher(cfg)
	// if err != nil {
	// 	return nil, err
	// }

	mainDb, err := db.GetMainDb(cfg)
	if err != nil {
		return nil, err
	}

	ctx := &CronTab{
		cfg:       cfg,
		cron:      cron.New(),
		msq:       msq,
		mainDb:    mainDb,
		cronNames: cronNames,
	}

	if err = ctx.Start(); err != nil {
		return nil, err
	}

	return ctx, err
}

// Start comment
func (ctx *CronTab) Start() error {
	// , strings.Join(ctx.cronNames, ",")
	cronRows, err := ctx.mainDb.
		Model(&models.CronTab{}).
		Select("cron_name, cron_spec, target_model, is_enabled").
		Where("is_enabled = ?", "1").
		Rows()
	if err != nil {
		return err
	}
	defer cronRows.Close()

	for cronRows.Next() {
		var (
			cronName    string
			cronSpec    string
			targetModel string
			isEnabled   int
		)

		err = cronRows.Scan(&cronName, &cronSpec, &targetModel, &isEnabled)
		if err != nil {
			return err
		}

		err = ctx.cron.AddFunc(cronSpec, func() {
			reportHandler := func(memberID string, organizationID string, userID string) (err error) {
				reportInfo := &job.ReportData{
					Name:           cronName,
					UserID:         userID,
					OrganizationID: organizationID,
					MemberID:       memberID,
				}

				data, err := json.Marshal(reportInfo)
				if err != nil {
					return err
				}

				errChan := make(chan error)
				go ctx.msq.Publish(cronName, data, errChan)
				if err := <-errChan; err != nil {
					return err
				}

				return err
			}

			switch targetModel {
			case "member":
				{
					ctx.ApplyEachMember(ctx.mainDb, reportHandler)
					break
				}
			case "user":
				{
					ctx.ApplyEachUser(ctx.mainDb, 0, reportHandler)
					break
				}
			case "organization":
				{
					ctx.ApplyEachOrganization(ctx.mainDb, 0, reportHandler)
					break
				}
			default:
				{
					ctx.ApplyOnce(ctx.mainDb, reportHandler)
					break
				}
			}
		})
		if err != nil {
			return err
		}
	}

	ctx.cron.Start()
	return err
}

// ApplyOnce comment
func (ctx *CronTab) ApplyOnce(mainDb *gorm.DB, handler CronJobHandler) (err error) {
	return handler("", "", "")
}

// ApplyEachMember comment
func (ctx *CronTab) ApplyEachMember(mainDb *gorm.DB, handler CronJobHandler) (err error) {
	memberRows, err := mainDb.
		Model(&models.Member{}).
		Select("id AS memberID").
		Rows()
	if err != nil {
		return err
	}
	defer memberRows.Close()

	for memberRows.Next() {
		var memberID string

		if err = memberRows.Scan(&memberID); err != nil {
			return err
		}

		if err := handler(memberID, "", ""); err != nil {
			return err
		}
	}
	return err
}

// ApplyEachOrganization comment
func (ctx *CronTab) ApplyEachOrganization(mainDb *gorm.DB, rowOffset int, handler CronJobHandler) (numRow int, err error) {
	orgRows, err := mainDb.
		Model(&models.Organization{}).
		Select("id AS organizationID, _member_id AS memberID").
		Limit(core.QueryRowLimit).
		Offset(rowOffset).
		Rows()
	if err != nil {
		return numRow, err
	}
	defer orgRows.Close()

	for orgRows.Next() {
		var (
			organizationID string
			memberID       string
		)

		if err = orgRows.Scan(&organizationID, &memberID); err != nil {
			return numRow, err
		}

		if err := handler(memberID, organizationID, ""); err != nil {
			return numRow, err
		}

		numRow++
		rowOffset++
	}

	if numRow == 0 {
		return numRow, err
	}

	if _, err = ctx.ApplyEachOrganization(mainDb, rowOffset, handler); err != nil {
		return numRow, err
	}

	return numRow, err
}

// ApplyEachUser comment
func (ctx *CronTab) ApplyEachUser(mainDb *gorm.DB, rowOffset int, handler CronJobHandler) (numRow int, err error) {
	userRows, err := mainDb.
		Model(&models.User{}).
		Select("id AS userID").
		Limit(core.QueryRowLimit).
		Offset(rowOffset).
		Rows()
	if err != nil {
		return numRow, err
	}
	defer userRows.Close()

	for userRows.Next() {
		var userID string

		if err = userRows.Scan(&userID); err != nil {
			return numRow, err
		}

		if err := handler("", "", userID); err != nil {
			return numRow, err
		}

		numRow++
		rowOffset++
	}

	if numRow == 0 {
		return numRow, err
	}

	if _, err = ctx.ApplyEachUser(mainDb, rowOffset, handler); err != nil {
		return numRow, err
	}

	return numRow, err
}

// Dispose comment
func (ctx *CronTab) Dispose() {
	if ctx.mainDb != nil {
		db, _ := ctx.mainDb.DB()
		defer db.Close()
	}

	if ctx.cron != nil {
		defer ctx.cron.Stop()
	}

	if ctx.msq != nil {
		defer ctx.msq.Dispose()
	}
}
