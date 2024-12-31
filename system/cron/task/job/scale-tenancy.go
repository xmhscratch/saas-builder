package job

import (
	"localdomain/cron-scheduler/core"
	"localdomain/cron-scheduler/db"
)

// Execute comment
func (ctx *ScaleTenancy) Execute(cfg *core.Config, rpd *ReportData) error {
	ctx.cfg = cfg
	ctx.report = rpd

	return nil
	// return ctx.Scale()
}

// Scale comment
func (ctx *ScaleTenancy) Scale() (err error) {
	mainDb, err := db.GetMainDb(ctx.cfg)
	if err != nil {
		return err
	}

	statsRows, err := mainDb.
		Raw(QueryFindAllTenantStats).
		Rows()
	if err != nil {
		return err
	}
	defer statsRows.Close()

	var tenantStockCount int64

	for statsRows.Next() {
		var (
			memberID string
			capacity int64
		)

		err = statsRows.Scan(
			&memberID,
			&capacity,
		)
		if err != nil {
			return err
		}

		if capacity < TenantCapacityLimit {
			tenantStockCount += TenantCapacityLimit - capacity
		}
	}

	if tenantStockCount <= TenantCapacityUpkeepThreshold {
		err = ctx.RestockTenancy()
	}

	return err
}

// RestockTenancy comment
func (ctx *ScaleTenancy) RestockTenancy() (err error) {
	var index int64
	for index = 0; index < RestockTenancyItemCount; index++ {
		// memberID := core.RandStringBytesMask(6)

		// memberDb, err := db.GetMemberDb(ctx.cfg, memberID)
		// if err != nil {
		// 	return err
		// }
		// defer memberDb.Dispose()

		// tx, err := memberDb.Connection.Begin()
		// if err != nil {
		// 	return err
		// }

		// 	stmt, err := tx.Prepare(QueryRecordWalletIncome)
		// 	if err != nil {
		// 		if err := tx.Rollback(); err != nil {
		// 			return err
		// 		}
		// 		return err
		// 	}
		// 	defer stmt.Close()

		// 	_, err = stmt.Exec(
		// 		item.ID,
		// 		item.Description,
		// 		item.BalanceIncome,
		// 		item.Items,
		// 		item.OrganizationID,
		// 	)

		// 	if err != nil {
		// 		if err := tx.Rollback(); err != nil {
		// 			return err
		// 		}
		// 		return err
		// 	}

		// 	return tx.Commit()
	}

	return err
}
