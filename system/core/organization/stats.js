const sequelize = require('sequelize')

const TenantRecord = require('../core/tenant-record')

const QUERY_GET_FREE_APP_COUNT = require('../core/queries/organization-stats/get-free-app-count')
const QUERY_GET_PAID_APP_COUNT = require('../core/queries/organization-stats/get-paid-app-count')

class OrganizationStats extends TenantRecord {
    
    /**
     * Gets all users
     * @method Router#updateLayout
     */
    async getMemberCount() {
        const { organizationId } = this
        const { OrganizationUser } = $ds.tables

        return OrganizationUser
            .count({
                where: { organizationId }
            })
            .catch(handleError)
    }

    /**
     * Gets all users
     * @method Router#updateLayout
     */
    async getFreeAppCount() {
        const { organizationId } = this

        const member = await this
            .getTenant()
            .catch(handleError)

        const connection = member.db.getConnection()

        const results = await connection
            .query(QUERY_GET_FREE_APP_COUNT, {
                type: connection.QueryTypes.SELECT,
                replacements: { organizationId },
            })
            .catch(handleError)

        return _.toNumber(
            _.get(results, '0.sum', 0)
        )
    }

    /**
     * Gets all users
     * @method Router#updateLayout
     */
    async getPaidAppCount() {
        const { organizationId } = this

        const member = await this
            .getTenant()
            .catch(handleError)

        const connection = member.db.getConnection()

        const results = await connection
            .query(QUERY_GET_PAID_APP_COUNT, {
                type: connection.QueryTypes.SELECT,
                replacements: { organizationId },
            })
            .catch(handleError)

        return _.toNumber(
            _.get(results, '0.sum', 0)
        )
    }
}

module.exports = OrganizationStats
