const traverse = require('traverse')
const objectHash = require('object-hash')
const expr = require('expression-eval')
const amqp = require('amqplib')

const BasicRecord = require('../core/basic-record')

const EVENT_NAME_REGEX = /([a-z0-9\_\-]+)\/([a-z0-9\_\-\,\ ]+)/g

/**
 * Represents a user
 * @class Hook
 */
class EventHooks extends BasicRecord {

    constructor() {
        super()

        this._initialized = false
        this._events = {}

        return this
    }

    async initialize() {
        if (this._initialized) {
            return this._events
        }

        const { EventHook } = $ds.tables
        const queryResults = await EventHook
            .findAndCountAll()
            .catch(handleError)

        this._events = _.map(queryResults.rows, (eventModel) => {
            return eventModel.get({ plain: true })
        })
        this._initialized = true
        return this._events
    }

    /**
     * Gets all users
     * @method Router#updateLayout
     */
    async create({
        topicName,
        action,
        triggerCondition,
        actionUrl,
    }) {
        const handlerId = objectHash({
            topicName,
            action,
            triggerCondition,
        })

        const { EventHook } = $ds.tables
        const { eventModel, isCreated } = await EventHook
            .findOrCreate({
                where: { handlerId },
                defaults: {
                    handlerId,
                    topicName, action, triggerCondition,
                    actionUrl,
                }
            })
            .spread((eventModel, isCreated) => {
                return { eventModel, isCreated }
            })
            .catch(handleError)

        if (!eventModel) {
            return handleError('cannot create event hook')
        }

        const eventInfo = eventModel.get({ plain: true })
        this._events[handlerId] = eventInfo

        return eventInfo
    }

    async findByName(eventName) {
        const { topicName, actions } = EventHooks.parseEventName(eventName)

        return _.filter(this._events, (e) => {
            return true
                && _.isEqual(e.topicName, topicName)
                && _.includes(actions, e.action)
        })
    }

    async trigger(eventName, eventData) {
        const eventInfos = await this
            .findByName(eventName)
            .catch(handleError)

        return Promise
            .map(eventInfos, async (eventInfo) => {
                const { triggerCondition } = eventInfo
                const ast = expr.parse(triggerCondition)

                if (!expr.eval(ast, eventData)) {
                    return true
                }
                return EventHooks.triggerEvent(eventInfo, eventData)
            })
            .catch(handleError)
    }

    static async triggerEvent(eventInfo, eventData) {
        const { actionUrl } = eventInfo

        const serializedData = JSON.stringify({
            url: actionUrl,
            data: traverse(eventData).map(function (v) {
                if (this.circular) { this.remove(); return }
                switch(true) {
                    case (_.isBoolean(v)): { return }
                    case (_.isNumber(v)): { return }
                    case (_.isString(v)): { return }
                    case (_.isArray(v)): { return }
                    case (_.isPlainObject(v)): { return }
                }
                this.remove(); return
            }),
        })
        const buffer = Buffer.from(serializedData)

        return $amqp
            .assertQueue('webhook', { durable: true })
            .then((_qok) => $amqp.sendToQueue('webhook', buffer))
            // .finally(() => connection.close())
    }

    static parseEventName(eventName) {
        // eventName = $topicName/$actions
        const atomic = new RegExp(EVENT_NAME_REGEX)
            .exec(eventName)

        const topicName = _.get(atomic, 1)
        const actions = _.chain(atomic)
            .get(2).split(',').map(_.trim)
            .value()

        return { topicName, actions }
    }
}

module.exports = EventHooks
module.exports.EVENT_NAME_REGEX = EVENT_NAME_REGEX
