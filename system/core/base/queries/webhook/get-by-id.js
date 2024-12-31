module.exports = (hookId) => {
    return (connection, done) => connection.query({
        sql: `
SELECT
    webhook.*
FROM
    webhooks AS webhook
WHERE
    webhook.id = :hookId
LIMIT 1;`
    },
    { hookId },
    (error, results, fields) => {
        return done(error, _.first(results))
    })
}
