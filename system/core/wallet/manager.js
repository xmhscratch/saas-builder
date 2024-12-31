const sequelize = require('sequelize')
const TenantRecord = require('../core/tenant-record')

const STATE_PENDING = 'pending'
const STATE_COMPLETE = 'complete'
const STATE_CANCELED = 'canceled'

class Wallet extends TenantRecord {

    constructor(walletId, { organizationId }) {
        super(organizationId)

        this.walletId = String(walletId)
        return this
    }

    /**
     * Gets all users
     * @method Router#updateLayout
     */
    static async createNew(organizationId, {
        id,
        description = '',
        balanceIncome = 0.0000,
        balanceOutcome = 0.0000,
        status = STATE_PENDING,
    }) {
        const member = await Wallet
            .getTenant(organizationId)
            .catch(handleError)

        const walletModel = await member.tables.Wallet
            .create({
                id,
                organizationId,
                description,
                balanceIncome,
                balanceOutcome,
                status,
            })
            .catch(handleError)

        if (!walletModel) {
            return handleError('wallet not found')
        }

        const results = walletModel.get({ plain: true })

        // $events({ organizationId }).dispatch('wallet/recorded', results)
        return results
    }

    /**
     * Gets all users
     * @method Router#updateLayout
     */
    async getInfo() {
        const { walletId, organizationId } = this

        const member = await $.Wallet
            .getTenant(organizationId)
            .catch(handleError)

        const walletModel = await member.tables.Wallet
            .findOne({
                where: { id: walletId, organizationId }
            })
            .catch(handleError)

        if (!walletModel) {
            return handleError(`Wallet with ID: ${walletId} not found`)
        }

        return walletModel.get({ plain: true })
    }

    /**
     * Gets all users
     * @method Router#updateLayout
     */
    async update({
        description,
        balanceIncome,
        balanceOutcome,
        status,
    }) {
        const { walletId, organizationId } = this

        const member = await this
            .getTenant()
            .catch(handleError)

        const walletModel = await member.tables.Wallet
            .findOne({ where: { id: walletId, organizationId } })
            .catch(handleError)

        if (!walletModel) {
            return handleError('wallet not found')
        }

        const results = await walletModel
            .update(
                Wallet.parseValues({
                    description,
                    balanceIncome,
                    balanceOutcome,
                    status,
                })
            )
            .catch(handleError)

        await walletModel
            .reload()
            .catch(handleError)

        // $events({ organizationId }).dispatch('wallet/updated', results)
        // $events({ organizationId }).dispatch(`wallet/status:${status}`, results)

        return results
    }

    /**
     * Gets all users
     * @method Router#updateLayout
     */
    async complete() {
        return this
            .update({ status: STATE_COMPLETE })
            .catch(handleError)
    }

    /**
     * Gets all users
     * @method Router#updateLayout
     */
    async cancel() {
        return this
            .update({ status: STATE_CANCELED })
            .catch(handleError)
    }

    /**
     * Gets all users
     * @method Router#updateLayout
     */
    async findAllInvoiceItems() {
        const { walletId, organizationId } = this

        const member = await $.Wallet
            .getTenant(organizationId)
            .catch(handleError)

        const results = await member.tables.InvoiceItem
            .findAndCountAll({
                where: { organizationId, walletId },
            })
            .catch(handleError)

        return {
            delta: {
                index: 0,
                total: results.count,
                limit: results.count,
                offset: 0
            },
            results: _.map(results.rows, (itemModel) => {
                return itemModel.get({ plain: true })
            })
        }
    }

    /**
     * Gets all users
     * @method Router#updateLayout
     */
    static parseValues(values) {
        return values
    }
}

module.exports = Wallet

module.exports.STATE_PENDING = 'pending'
module.exports.STATE_COMPLETE = 'complete'
module.exports.STATE_CANCELED = 'canceled'
