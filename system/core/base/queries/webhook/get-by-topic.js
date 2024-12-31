module.exports = (topicName, {
    offset = 0,
    limit = 7
} = {}) => {
    return (connection, done) => connection.query({
        sql: `
SELECT
    webhook.*
FROM
    webhooks AS webhook
WHERE FIND_IN_SET(:topicName, webhook.topic) > 0
LIMIT :limit
OFFSET :offset
;`
    },
    { topicName, limit, offset },
    (error, results, fields) => {
        return done(error, results)
    })
}
