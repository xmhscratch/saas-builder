module.exports = (hookId) => {
    return (connection, done) => connection.query({
        sql: `
DELETE FROM webhooks
WHERE webhooks.id = :hookId;`
    },
    { hookId },
    (error, results, fields) => {
        return done(error, results)
    })
}
