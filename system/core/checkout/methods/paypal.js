const Payment = require('../payment')

class Paypal extends Payment {

    constructor(paymentId, { organizationId }) {
        super(paymentId, { organizationId })

        this.paypal = require('paypal-rest-sdk')
        this.paypal.configure(config(`paypal.${config('paypal.mode')}`))

        return this
    }

    static async createNew(organizationId, {
        couponCode = null,
        grandTotal = 0.0000,
    }) {
        const paymentInfo = await super
            .createNew(organizationId, {
                method: 'paypal',
                couponCode,
                grandTotal,
            })
            .catch(handleError)

        const paymentId = paymentInfo.id
        return new Paypal(paymentId, { organizationId })
            .createOrder(paymentInfo, { couponCode, grandTotal })
            .catch(handleError)
    }

    async createOrder(paymentInfo, {
        couponCode = null,
        grandTotal = 0.0000,
    }) {
        const { paypal } = this
        // const { paymentId, organizationId } = this

        return new Promise((resolve, reject) => {
            return paypal.payment.create({
                intent: 'order',
                payer: { payment_method: 'paypal', },
                redirect_urls: {
                    return_url: this.getReturnCallbackURL(),
                    cancel_url: this.getCancelCallbackURL(),
                },
                transactions: [{
                    amount: {
                        currency: Payment.DEFAULT_CURRENCY_CODE,
                        total: grandTotal,
                    },
                    description: `Paypal`,
                }]
            }, (error, resp) => {
                if (error) {
                    return reject(error)
                }
                if (!resp) {
                    return reject('cannot get response from paypal')
                }
                const link = _.find(resp.links, ['rel', 'approval_url'])
                if (!link) {
                    return reject('cannot get response from paypal')
                }
                const requestUrl = link.href
                return this
                    .update({ requestUrl })
                    .then(resolve)
            })
        }).catch(handleError)
    }

    async paySuccess() {
        const { paymentId, organizationId } = this

        const paymentInfo = await this
            .getInfo()
            .catch(handleError)

        if (!paymentInfo) {
            return handleError('payment not found')
        }

        await $.Wallet
            .createNew(organizationId, {
                id: `pyi_${paymentId}_${paymentInfo.reservedCode}`,
                description: `Paypal`,
                balanceIncome: paymentInfo.grandTotal,
                balanceOutcome: 0.0000,
            })
            .catch(handleError)

        return this
            .changeStatus(Payment.STATE_PROCESSING)
            .catch(handleError)
    }

    async payFailure() {
        const paymentInfo = await this
            .getInfo()
            .catch(handleError)

        if (!paymentInfo) {
            return handleError('payment not found')
        }

        return this
            .changeStatus(Payment.STATE_FAILURE)
            .catch(handleError)
    }

    getReturnCallbackURL() {
        const { paymentId } = this
        const callbackURI = config('urls.account')

        return `https://${callbackURI}/paypal/success/${paymentId}`
    }

    getCancelCallbackURL() {
        const { paymentId } = this
        const callbackURI = config('urls.integration')

        return `https://${callbackURI}/paypal/cancel/${paymentId}`
    }
}

module.exports = Paypal
