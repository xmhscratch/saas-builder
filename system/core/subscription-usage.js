const { Op } = require('sequelize')
const TenantRecord = require('./core/tenant-record')

/**
 * Represents a user
 * @class SubscriptionUsageSingleton
 */
class SubscriptionUsageSingleton extends TenantRecord {

    constructor({ organizationId }) {
        super(organizationId)
        return this
    }

    /**
     * Gets all users
     * @method Router#updateLayout
     */
    async configure(appName, planName) {
        const { organizationId } = this

        const app = new $.App(appName, { organizationId })
        const manifestInfo = await app
            .getManifestInfo()
            .catch(handleError)

        const quotaInfo = _.get(manifestInfo, `billing.${planName}.quota`, {})
        const defaultUsages = _
            .chain(quotaInfo)
            .reduce((m, v, k) => {
                m.push({
                    quotaName: `${appName}.${k}`,
                    quotaCap: Number.parseFloat(v),
                })
                return m
            }, [])
            .value()

        const member = await this
            .getTenant()
            .catch(handleError)

        const { SubscriptionUsage } = member.tables
        await Promise
            .map(defaultUsages, (defaultUsage) => {
                return SubscriptionUsage
                    .upsert(SubscriptionUsageSingleton.parseValues(
                        { organizationId, ...defaultUsage, },
                    ))
                    .catch(handleError)
            })
            .catch(handleError)

        return true
    }

    /**
     * Gets all users
     * @method Router#updateLayout
     */
    async loadModel(quotaName) {
        const { organizationId } = this

        const member = await this
            .getTenant()
            .catch(handleError)

        const { SubscriptionUsage } = member.tables
        const usageModel = await SubscriptionUsage
            .findOne({
                where: { quotaName, organizationId },
                // logging: console.log,
            })
            .catch(handleError)

        return usageModel
    }

    /**
     * Gets all users
     * @method Router#updateLayout
     */
    async add(quotaName, newValue) {
        const usageModel = await this
            .loadModel(quotaName)
            .catch(handleError)

        await usageModel
            .increment('quotaValue', {
                by: newValue,
                where: {
                    quotaValue: { [Op.gte]: 0 },
                },
                // logging: true,
            })
            .catch(handleError)

        return true
    }

    /**
     * Gets all users
     * @method Router#updateLayout
     */
    async minus(quotaName, newValue) {
        const usageModel = await this
            .loadModel(quotaName)
            .catch(handleError)

        await usageModel
            .decrement('quotaValue', {
                by: newValue,
                where: {
                    quotaValue: { [Op.gt]: 0 },
                },
                // logging: true,
            })
            .catch(handleError)

        return true
    }

    /**
     * Gets all users
     * @method Router#updateLayout
     */
    async set(quotaName, newValue) {
        const { organizationId } = this

        const member = await this
            .getTenant()
            .catch(handleError)

        const quotaValue = _.max([0, Number.parseFloat(newValue)])
        const { SubscriptionUsage } = member.tables

        await SubscriptionUsage
            .upsert(SubscriptionUsageSingleton.parseValues(
                { organizationId, quotaName, quotaValue, },
            ))
            .catch(handleError)

        return true
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
                case 'quotaName':
                    _.extend(results, { quotaName: value })
                    break
                case 'quotaCap':
                case 'quotaValue':
                    _.extend(results, { [key]: Number.parseFloat(value) || 0.0000 })
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

module.exports = SubscriptionUsageSingleton
