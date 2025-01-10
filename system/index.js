const setupCore = require('./setup/core')
const setupMysql = require('./setup/mysql')
const setupRedis = require('./setup/redis')
const setupAMQP = require('./setup/amqp')
const setupMongo = require('./setup/mongo')
const setupElastic = require('./setup/elastic')
const setupInflux = require('./setup/influx')
// const setupGoogleFont = require('./setup/google-font')

const ensureCollection = require('./helper/ensure-collection')
const blacklistKeys = require('./helper/blacklist-keys')

global.PROC_ENV_TLD = process.env.TLD || 'com'
global.CONTEXT_KEY = require('./schema/fixtures/context-key')

// global.$setup = {
//     mysql: setupMysql,
//     redis: setupRedis,
//     amqp: setupAMQP,
//     mongo: setupMongo,
//     elastic: setupElastic,
//     googleFont: setupGoogleFont,
// }

global.handleError = (error) => {
    if (_.isString(error)) { error = new Error(error) }
    if (_.isArrayLikeObject(error)) { error = new Error(JSON.stringify(error)) }

    // console.log(error)
    // Promise.reject(error)

    throw error
}

process.on('exit', (code) => {
    if (global.$amqp) { global.$amqp.destroy() }
    if (global.$redis) { global.$redis.quit() }
})

if (global.gc) {
    global.gc() & setInterval(function () {
        return global.gc()
    }, 1800000)
}

module.exports = async function (options) {
    options = _.defaults(options, {
        setupMysql: true,
        setupAmqp: true,
        setupMongo: true,
        setupRedis: true,
        setupElastic: false,
        setupInflux: true,
        setupGoogleFont: true,
        setupCore: false,
    })

    if (options.setupMysql) {
        global.$ds = await setupMysql().catch(handleError)
    }
    if (options.setupAmqp) {
        global.$amqp = await setupAMQP().catch(handleError)
    }
    if (options.setupMongo) {
        global.$mongo = await setupMongo().catch(handleError)
    }
    if (options.setupRedis) {
        global.$redis = await setupRedis().catch(handleError)
        global.$downloadRedis = await setupRedis(5).catch(handleError)

        global.$progressRedis = await setupRedis(7).catch(handleError)
        global.$progressPubsubRedis = await setupRedis(7).catch(handleError)
        global.$progressPubsubRedis.subscribe('photo:dimensionalize')
        global.$progressPubsubRedis.subscribe('customer:import')
        global.$progressPubsubRedis.subscribe('customer:export')

        global.$statRedis = await setupRedis(11).catch(handleError)
        global.$statPubsubRedis = await setupRedis(11).catch(handleError)
        global.$statPubsubRedis.subscribe('client:visitor')
        global.$statPubsubRedis.subscribe('client:view')
    }
    if (options.setupElastic) {
        global.$elastic = await setupElastic().catch(handleError)
    }
    if (options.setupInflux) {
        global.$influx = await setupInflux().catch(handleError)
    }

    global.$qs = require('./classes/core/queries/storage/qs')

    global.$helper = {
        ensureCollection,
        blacklistKeys,
        string: require('./classes/core/string'),
        color: require('./classes/core/color'),
        sendmail: require('./classes/core/sendmail'),
        escapeParams: (params) => _.mapKeys(params, (_, k) => `:${k}`),
        Tree: require('./classes/core/tree'),
    }

    _.extend(global.$, require('./classes'))

    if (options.setupMongo && options.setupGoogleFont) {
        console.time(`ensure google fonts exist...`)

        global.$googleFont = new $.GoogleFont()
        await global.$googleFont
            .initialize()
            .catch(handleError)

        console.timeEnd(`ensure google fonts exist...`)
    }

    if (options.setupAmqp && options.setupMysql) {
        const _events = new $.EventHooks()

        await _events
            .initialize()
            .catch(handleError)

        global.$events = _events
        global.$event = async (eventName, eventData) => {
            return _events.trigger(eventName, eventData)
        }
        global.$.usage = (organizationId) => {
            return new $.SubscriptionUsage({ organizationId })
        }
    }

    if (options.setupCore) {
        await setupCore(options).catch(handleError)
    }
}

// const { v5: uuidV5 }  = require('uuid')
// await firstOrg('organization', '_setupCustomerDatabase')
//     .exec({ organizationId })
//     .catch(handleError)

// await firstOrg('organization', '_setupStorage')
//     .exec({ organizationId })
//     .catch(handleError)

// await firstOrg('organization', '_setupActionRequestFieldVariables')
//     .exec({ organizationId })
//     .catch(handleError)

// await firstOrg('organization', '_setupIngresses')
//     .exec({ organizationId })
//     .catch(handleError)

// await firstOrg('ingress', 'createNewForAction')
//     .exec(
//     )
//     .catch(handleError)
