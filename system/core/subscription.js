const dayjs = require('dayjs')

const TenantRecord = require('./core/tenant-record')

/**
 * Represents a user
 * @class Subscription
 */
class SubscriptionSingleton extends TenantRecord {

    constructor(appName, { organizationId }) {
        super(organizationId)

        this.appName = String(appName)
        this.manifest = new $.AppManifest(appName)

        return this
    }

    /**
     * Gets all users
     * @method Router#updateLayout
     */
    async getInfo() {
        const { organizationId, appName } = this

        const member = await this
            .getTenant()
            .catch(handleError)

        const { Subscription } = member.tables
        const subscriptionModel = await Subscription
            .findOne({
                where: { organizationId, appName },
            })
            .catch(handleError)

        if (subscriptionModel) {
            return subscriptionModel.get({ plain: true })
        }

        const appInfo = await new $.App(appName, { organizationId })
            .getInstalled()
            .catch(handleError)

        if (appInfo && appInfo.billing) {
            return _.extend({
                appName,
                organizationId,
            }, appInfo.billing[appInfo.defaultPlan || 'free'])
        }

        return {
            appName,
            organizationId,
            planName: 'free',
            monthlyPrice: 0.000,
            feeRate: 0.0000,
            createdAt: new Date(),
            trialDayPeriod: null,
        }
    }

    /**
     * Gets all users
     * @method Router#updateLayout
     */
    async subscribe(planName) {
        const { organizationId, appName } = this

        const createdAt = new Date()
        const manifestMonthlyPriceInfo = await this.manifest
            .getValue(`billing.${planName}.monthlyPrice`)
            .catch(handleError)
        const monthlyPrice = _.toNumber(manifestMonthlyPriceInfo.configValue)

        const manifestTrialDayPeriodInfo = await this.manifest
            .getValue(`billing.${planName}.trialDayPeriod`)
            .catch(handleError)
        const trialDayPeriod = _.toNumber(manifestTrialDayPeriodInfo.configValue)
        const trialExpiredAt = dayjs(createdAt).add(trialDayPeriod, 'days')

        const member = await this
            .getTenant()
            .catch(handleError)

        const { Subscription } = member.tables
        await Subscription
            .upsert(
                SubscriptionSingleton.parseValues({
                    organizationId, appName,
                    planName, monthlyPrice,
                    feeRate: (monthlyPrice * 12) / 8765.82,
                    createdAt, trialExpiredAt,
                })
            )
            .catch(handleError)

        const subscriptionInfo = await this
            .getInfo()
            .catch(handleError)

        return subscriptionInfo
    }

    /**
     * Gets all users
     * @method Router#updateLayout
     */
    async unsubscribe() {
        const { organizationId, appName } = this

        const member = await this
            .getTenant()
            .catch(handleError)

        const subscriptionModel = await member.tables.Subscription
            .findOne({ where: { organizationId, appName } })
            .catch(handleError)

        if (!subscriptionModel) {
            return handleError('subscription not found')
        }

        await subscriptionModel
            .destroy({ force: true })
            .catch(handleError)

        return true
    }

    /**
     * Gets all users
     * @method Router#updateLayout
     */
    async changeStatus(statusName) {
        const { organizationId, appName } = this

        const member = await this
            .getTenant()
            .catch(handleError)

        const { Subscription } = member.tables
        const {
            STATUS_ACTIVE,
            STATUS_SUSPEND,
            STATUS_UPGRADE,
        } = Subscription

        let status
        switch (statusName) {
            default:
            case 'active':
                status = STATUS_ACTIVE
                break;

            case 'suspend':
                status = STATUS_SUSPEND
                break;

            case 'upgrade':
                status = STATUS_UPGRADE
                break;
        }

        let subscriptionModel = await Subscription
            .findOne({ where: { organizationId, appName } })
            .catch(handleError)

        if (!subscriptionModel) {
            return handleError('subscription not found')
        }

        subscriptionModel = await subscriptionModel
            .update(SubscriptionSingleton.parseValues(
                { organizationId, appName, status, },
            ))
            .catch(handleError)

        if (!subscriptionModel) {
            return handleError('cannot update subscription')
        }

        await subscriptionModel
            .reload()
            .catch(handleError)

        return subscriptionModel.get({ plain: true })
    }

    async active() {
        return this
            .changeStatus('active')
            .catch(handleError)
    }

    async suspend() {
        return this
            .changeStatus('suspend')
            .catch(handleError)
    }

    async upgrade() {
        return this
            .changeStatus('upgrade')
            .catch(handleError)
    }

    async trial() {
        return this
            .changeStatus('trial')
            .catch(handleError)
    }

    /**
     * Gets all users
     * @method Router#updateLayout
     */
    static parseValues(values, { includes, excludes } = {}) {
        let results = {}

        _.forEach(values, (value, key) => {
            switch (key) {
                case 'organizationId':
                    _.extend(results, { organizationId: value })
                    break
                case 'appName':
                    _.extend(results, { appName: value })
                    break
                case 'planName':
                    _.extend(results, { planName: value })
                    break
                case 'monthlyPrice':
                    _.extend(results, { monthlyPrice: Number.parseFloat(value) || 0.00 })
                    break
                case 'feeRate':
                    _.extend(results, { feeRate: Number.parseFloat(value) || 0.0000 })
                    break
                case 'createdAt':
                    _.extend(results, { createdAt: new Date(value) })
                    break
                case 'trialExpiredAt':
                    _.extend(results, { trialExpiredAt: !_.isNil(value) ? new Date(value) : null })
                    break
                default: break
            }
        })

        if (includes) {
            results = _.pick(results, includes)
        }

        if (excludes) {
            results = _.omit(results, excludes)
        }

        return results
    }
}

module.exports = SubscriptionSingleton
