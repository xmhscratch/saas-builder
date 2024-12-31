module.exports = (hookId, {
    address,
    topic
} = {}) => {
    let vars = { address, topic }
    vars.updatedAt = new Date()

    let sqlUpdate = []
    _.forEach({
        address: 'address',
        topic: 'topic',
        updatedAt: 'updated_at'
    }, (colName, valName) => {
        if (!_.isUndefined(vars[valName])) {
            sqlUpdate.push(`webhook.${colName} = \:${valName}`)
        }
    })

    return (connection, done) => {
        if (_.isEmpty(sqlUpdate)) {
            return done(null, {})
        }
        sqlUpdate = _.join(sqlUpdate, ',\n    ')

        return connection.query({
            sql: `
UPDATE
    webhooks AS webhook
SET
    ${sqlUpdate}
WHERE webhook.id = :hookId;`
        },
        _.merge({ hookId }, vars),
        (error, results, fields) => {
            return done(error, results)
        })
    }
}
