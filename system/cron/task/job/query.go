package job

// // QueryFindInvoiceItems comment
// const QueryFindInvoiceItems = `
// SELECT
// 	id AS paymentID,
// 	description AS description,
// 	quantity AS quantity,
// 	sub_total AS subTotal,
// 	start_date AS startDate,
// 	end_date AS endDate,
// 	_organization_id AS organizationID
// FROM invoice_items
// WHERE MONTH(end_date) = MONTH(?)
// 	AND YEAR(end_date) = YEAR(?)
// 	AND _organization_id = ?
// ;`

// QueryFindAllTenantStats comment
const QueryFindAllTenantStats = `
SELECT
	_member_id AS memberID,
	COUNT(id) AS capacity
FROM organizations
GROUP BY _member_id
;`

// QueryCreateNewTenancyDatabase comment
const QueryCreateNewTenancyDatabase = `
CREATE DATABASE IF NOT EXISTS ? DEFAULT CHARACTER SET ascii COLLATE ascii_general_ci
;`

// QuerySetupNewTenancyDatabase comment
const QuerySetupNewTenancyDatabase = `
CREATE TABLE IF NOT EXISTS _members (
  id char(36) NOT NULL,
  created_at datetime NOT NULL,
  updated_at datetime NOT NULL,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=ascii
;`

// QueryRecordNewTenancyMember comment
const QueryRecordNewTenancyMember = `
INSERT INTO _members (id, created_at, updated_at) VALUES
(?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
;`

// QueryIncrementSubscriptionUsage comment
const QueryIncrementSubscriptionUsage = `
UPDATE subscription_usages
SET quota_value=quota_value+1
WHERE (quota_name = ?)
	AND (_organization_id = ?)
	AND (quota_value >= 0)
;`

// QueryDecrementSubscriptionUsage comment
const QueryDecrementSubscriptionUsage = `
UPDATE subscription_usages
SET quota_value=quota_value-1
WHERE (quota_name = ?)
	AND (_organization_id = ?)
	AND (quota_value > 0)
;`
