const TenantRecord = require('../core/tenant-record')

class Wallets extends TenantRecord {

    /**
     * Gets all users
     * @method Router#updateLayout
     */
    async getAll({ limit = 20, offset = 0 }) {
        const { organizationId } = this

        const member = await this
            .getTenant()
            .catch(handleError)

        const results = await member.tables.Wallet
            .findAndCountAll({
                where: { organizationId },
                order: [
                    ['createdAt', 'DESC'],
                ],
                limit, offset,
            })
            .catch(handleError)

        return {
            delta: {
                index: Math.floor(offset / limit),
                total: results.count,
                limit: limit,
                offset: offset
            },
            results: _.map(results.rows, (walletModel) => {
                return walletModel.get({ plain: true })
            }),
        }
    }
}

module.exports = Wallets
