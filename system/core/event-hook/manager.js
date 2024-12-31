const BasicRecord = require('../core/basic-record')

/**
 * Represents a user
 * @class Node
 */
class EventHook extends BasicRecord {

    constructor(handlerId) {
        super()

        this.handlerId = String(handlerId)
        return this
    }

    /**
     * Gets all users
     * @method Router#updateLayout
     */
    async getInfo() {
        const { handlerId } = this

        const eventModel = await $ds.tables.EventHook
            .findOne({ where: { handlerId } })
            .catch(handleError)

        if (!eventModel) {
            return handleError(`Hook with handler ${handlerId} not found`)
        }

        return eventModel.get({ plain: true })
    }

    /**
     * Gets all users
     * @method Router#updateLayout
     */
    async update(values) {
        const { handlerId } = this

        const eventModel = await $ds.tables.EventHook
            .findOne({ where: { handlerId } })
            .catch(handleError)

        if (!eventModel) {
            return handleError(`Hook with handler ${handlerId} not found`)
        }

        const results = await eventModel
            .update(EventHook.parseValues(values))
            .catch(handleError)

        await eventModel
            .reload()
            .catch(handleError)

        return results
    }

    /**
     * Gets all users
     * @method Router#updateLayout
     */
    async deleteAll() {
        const { handlerId } = this

        return $ds.tables.EventHook
            .destroy({
                where: { handlerId },
                force: true,
            })
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

module.exports = EventHook
