const sequelize = require('sequelize')

const TenantRecord = require('../core/tenant-record')

class WalletStats extends TenantRecord {

    /**
     * Gets all users
     * @method Router#updateLayout
     */
    async getChargeThisMonth() {
        const { organizationId } = this

        const member = await this
            .getTenant()
            .catch(handleError)

        const results = await member.tables.Contermet
            .sum('chargeValue', {
                where: {
                    month: sequelize.literal('MONTH(CURRENT_TIMESTAMP)'),
                    year: sequelize.literal('YEAR(CURRENT_TIMESTAMP)'),
                    organizationId,
                }
            })
            .catch(handleError)

        return results || 0.0000
    }

    /**
     * Gets all users
     * @method Router#updateLayout
     */
    async getMonthlyFees() {
        const { organizationId } = this

        const member = await this
            .getTenant()
            .catch(handleError)

        const subscriptionModel = await member.tables.Subscription
            .findOne({
                attributes: [
                    // 'balance_income',
                    // 'balance_outcome',
                    [sequelize.fn('SUM', (
                        sequelize.literal(
                            '(COALESCE(fee_rate, 0.0000) * 24) * DAY(LAST_DAY(CURRENT_TIMESTAMP))'
                        )
                    )), 'value']
                ],
                group: ['_organization_id'],
                where: { organizationId },
            })
            .catch(handleError)

        if (!subscriptionModel) {
            return 0.0000
        }

        return subscriptionModel.get('value')
    }

    /**
     * Gets all users
     * @method Router#updateLayout
     */
    async getRemainingCredit() {
        const { organizationId } = this

        const member = await this
            .getTenant()
            .catch(handleError)

        const walletModel = await member.tables.Wallet
            .findOne({
                attributes: [
                    // 'balance_income',
                    // 'balance_outcome',
                    [sequelize.fn('SUM', (
                        sequelize.literal(
                            'COALESCE(balance_income, 0.0000) - COALESCE(balance_outcome, 0.0000)'
                        )
                    )), 'value']
                ],
                group: ['_organization_id'],
                where: { organizationId }
            })
            .catch(handleError)

        if (!walletModel) {
            return 0.0000
        }
    
        return walletModel.get('value')
    }
}

module.exports = WalletStats
