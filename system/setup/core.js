const { performance } = require('perf_hooks')

const {
    CORE_MODEL_SCHEMA_PRIORITY,
    MEMBER_MODEL_SCHEMA_PRIORITY,
    CUSTOMER_MODEL_SCHEMA_PRIORITY,
} = require('../schema-priority')

$._syncModelSchemas = {}

const userId = 'e9c7a3bc-1da5-4ceb-b6ac-0a6450d45ec3'
const organizationId = '1ef19f81-a3a1-45a2-9203-b792abcddc52'

module.exports = async function (options) {
    if (options.setupMysql) {
        console.time(`setup database tenant tables...`)

        await Promise
            .map(_.values($ds.tables), (model) => model.sync())
            .catch(handleError)

        await (async () => {
            const unordered = _.reduce(CORE_MODEL_SCHEMA_PRIORITY, (m, k, o) => { k = _.toNumber(k); m[k] = m[k] || []; m[k].push(o); return m }, {})
            const ordered = _.keys(unordered).sort().reduce((obj, key) => { obj[key] = unordered[key]; return obj }, {})

            await Promise
                .mapSeries(_.values(ordered), (schemaNames) => Promise
                    .mapSeries(schemaNames, async (schemaName) => {
                        const startTime = performance.now()
                        !_.isFunction($ds.tables[schemaName]) || await $ds.tables[schemaName].sync()
                        !_.isFunction($._syncModelSchemas[schemaName]) || await $._syncModelSchemas[schemaName]()
                        const endTime = performance.now()

                        const elapsedTime = _.round(endTime - startTime, 2)
                        await Promise.delay(elapsedTime)
                        // return console.log(`${schemaName}: ${elapsedTime}ms`)
                    })
                )
                .catch(handleError)
        })()

        console.timeEnd(`setup database tenant tables...`)

        console.time(`setup database tenant member tables...`)

        const member = await $.Organizations
            .getTenant(organizationId)
            .catch(handleError)

        await Promise
            .map(_.values(member.tables), (model) => model.sync())
            .catch(handleError)

        await (async () => {
            const unordered = _.reduce(MEMBER_MODEL_SCHEMA_PRIORITY, (m, k, o) => { k = _.toNumber(k); m[k] = m[k] || []; m[k].push(o); return m }, {})
            const ordered = _.keys(unordered).sort().reduce((obj, key) => { obj[key] = unordered[key]; return obj }, {})

            await Promise
                .mapSeries(_.values(ordered), (schemaNames) => Promise
                    .mapSeries(schemaNames, async (schemaName) => {
                        const startTime = performance.now()
                        !_.has(member.tables, schemaName) || await member.tables[schemaName].sync()
                        !_.isFunction($._syncModelSchemas[schemaName]) || await $._syncModelSchemas[schemaName]()
                        const endTime = performance.now()

                        const elapsedTime = _.round(endTime - startTime, 2)
                        await Promise.delay(elapsedTime)
                        // return console.log(`${schemaName}: ${elapsedTime}ms`)
                    })
                )
                .catch(handleError)
        })()

        console.timeEnd(`setup database tenant member tables...`)
    }

    if (options.setupMongo) {
        console.time(`ensure all default mongodb collection exists...`)

        // await Promise
        //     .all([
        //         $helper.ensureCollection($mongo, 'test_db', 'test_collection'),
        //     ])
        //     .catch(handleError)

        console.timeEnd(`ensure all default mongodb collection exists...`)
    }

    if (options.setupAmqp && options.setupMysql) {
        console.time(`import default organization data...`)

        const firstOrg = $system({ organizationId, userId })

        await firstOrg('app', 'install')
            .exec('core', { organizationId })
            .catch(handleError)

        await firstOrg('organization', '_setupOrganization')
            .exec({ organizationId })
            .catch(handleError)

        await firstOrg('subscription', 'subscribe')
            .exec('core', 'standard', { organizationId })
            .catch(handleError)

        const customerDb = await System.Orm.Db
            .connect(
                `customer_${organizationId}`,
                config('database.username'),
                config('database.password'),
                {
                    ...config('database.options'),
                    database: `customer_${organizationId}`,
                },
            )
            .load($.path.join(config('system.rootDirPath'), '/system/schema/customer'), false)
            .catch(handleError)

        await Promise
            .map(_.values(customerDb.tables), (model) => model.sync())
            .catch(handleError)

        await (async () => {
            const unordered = _.reduce(CUSTOMER_MODEL_SCHEMA_PRIORITY, (m, k, o) => { k = _.toNumber(k); m[k] = m[k] || []; m[k].push(o); return m }, {})
            const ordered = _.keys(unordered).sort().reduce((obj, key) => { obj[key] = unordered[key]; return obj }, {})

            await Promise
                .mapSeries(_.values(ordered), (schemaNames) => Promise
                    .mapSeries(schemaNames, async (schemaName) => {
                        const startTime = performance.now()
                        !_.has(customerDb.tables, schemaName) || await customerDb.tables[schemaName].sync()
                        !_.isFunction($._syncModelSchemas[schemaName]) || await $._syncModelSchemas[schemaName]()
                        const endTime = performance.now()

                        const elapsedTime = _.round(endTime - startTime, 2)
                        await Promise.delay(elapsedTime)
                        // return console.log(`${schemaName}: ${elapsedTime}ms`)
                    })
                )
                .catch(handleError)
        })()

        console.timeEnd(`import default organization data...`)
    }
}
