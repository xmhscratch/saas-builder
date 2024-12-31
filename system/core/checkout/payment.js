const TenantRecord = require('../core/tenant-record')

const { randomString } = require('../core/string')

const DEFAULT_CURRENCY_CODE = 'USD'
const STATE_NEW = 'new'
const STATE_PROCESSING = 'processing'
const STATE_COMPLETE = 'complete'
const STATE_CLOSED = 'closed'
const STATE_CANCELED = 'canceled'
const STATE_FAILURE = 'failure'

class Payment extends TenantRecord {

    constructor(paymentId, { organizationId }) {
        super(organizationId)

        this.paymentId = String(paymentId)
        this.organizationId = String(organizationId)

        return this
    }

    /**
     * Gets all users
     * @method Router#updateLayout
     */
    static async createNew(organizationId, {
        method = 'directcard',
        requestUrl = null,
        couponCode = null,
        discountAmount = 0.0000,
        discountCanceled = 0.0000,
        discountInvoiced = 0.0000,
        discountRefunded = 0.0000,
        grandTotal = 0.0000,
        totalCanceled = 0.0000,
        totalInvoiced = 0.0000,
        totalPaid = 0.0000,
        totalRefunded = 0.0000,
        adjustmentNegative = 0.0000,
        adjustmentPositive = 0.0000,
        globalCurrencyCode = DEFAULT_CURRENCY_CODE,
    }) {
        const member = await $.Wallet
            .getTenant(organizationId)
            .catch(handleError)

        const { Payment } = member.tables
        const paymentModel = await Payment
            .create({
                reservedCode: randomString(8),
                organizationId,
                method,
                requestUrl,
                couponCode,
                discountAmount,
                discountCanceled,
                discountInvoiced,
                discountRefunded,
                grandTotal,
                totalCanceled,
                totalInvoiced,
                totalPaid,
                totalRefunded,
                adjustmentNegative,
                adjustmentPositive,
                globalCurrencyCode,
                status: STATE_NEW,
            })
            .catch(handleError)

        if (!paymentModel) {
            return handleError('cannot create payment')
        }

        const results = paymentModel.get({ plain: true })

        // $events({ organizationId }).dispatch('payment/recorded', results)
        return results
    }

    /**
     * Gets all users
     * @method Router#updateLayout
     */
    static async findAll(organizationId, { limit = 10, offset = 0 }) {
        const member = await $.Wallet
            .getTenant(organizationId)
            .catch(handleError)

        const { Payment } = member.tables
        const results = await Payment
            .findAndCountAll({
                where: { organizationId },
                limit, offset,
            })
            .catch(handleError)

        return {
            delta: {
                index: Math.floor(offset / limit),
                total: results.count,
                limit, offset,
            },
            results: _.map(results.rows, (paymentModel) => {
                return paymentModel.get({ plain: true })
            }),
        }
    }

    /**
     * Gets all users
     * @method Router#updateLayout
     */
    async getInfo() {
        const { paymentId, organizationId } = this

        const member = await $.Wallet
            .getTenant(organizationId)
            .catch(handleError)

        const paymentModel = await member.tables.Payment
            .findOne({
                where: { id: paymentId, organizationId }
            })
            .catch(handleError)

        if (!paymentModel) {
            return handleError('payment not found')
        }

        return paymentModel.get({ plain: true })
    }

    /**
     * Gets all users
     * @method Router#updateLayout
     */
    async update({
        requestUrl,
        couponCode,
        discountAmount,
        discountCanceled,
        discountInvoiced,
        discountRefunded,
        grandTotal,
        totalCanceled,
        totalInvoiced,
        totalPaid,
        totalRefunded,
        adjustmentNegative,
        adjustmentPositive,
        status,
    }) {
        const { paymentId, organizationId } = this

        const member = await $.Wallet
            .getTenant(organizationId)
            .catch(handleError)

        const paymentModel = await member.tables.Payment
            .findOne({ where: { id: paymentId, organizationId } })
            .catch(handleError)

        const results = await paymentModel
            .update(
                Payment.parseValues({
                    requestUrl,
                    couponCode,
                    discountAmount,
                    discountCanceled,
                    discountInvoiced,
                    discountRefunded,
                    grandTotal,
                    totalCanceled,
                    totalInvoiced,
                    totalPaid,
                    totalRefunded,
                    adjustmentNegative,
                    adjustmentPositive,
                    status,
                })
            )
            .catch(handleError)

        await paymentModel
            .reload()
            .catch(handleError)

        // $events({ organizationId }).dispatch('payment/updated', results)
        // $events({ organizationId }).dispatch(`payment/status:${status}`, results)

        return results
    }

    /**
     * Gets all users
     * @method Router#updateLayout
     */
    async changeStatus(status = STATE_NEW) {
        return this
            .update({ status })
            .catch(handleError)
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
    async makeInvoice() {
        return this
            .update({ status: STATE_CLOSED })
            .catch(handleError)
    }

    /**
     * Gets all users
     * @method Router#updateLayout
     */
    static parseValues(values) {
        return values
    }
}

module.exports = Payment

module.exports.DEFAULT_CURRENCY_CODE = DEFAULT_CURRENCY_CODE
module.exports.STATE_NEW = STATE_NEW
module.exports.STATE_PROCESSING = STATE_PROCESSING
module.exports.STATE_COMPLETE = STATE_COMPLETE
module.exports.STATE_CLOSED = STATE_CLOSED
module.exports.STATE_CANCELED = STATE_CANCELED
module.exports.STATE_FAILURE = STATE_FAILURE
