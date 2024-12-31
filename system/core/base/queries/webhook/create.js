module.exports = ({
    address,
    topic
} = {}) => {
    const hookId = appl.helper('@string').uuidV4()
    const createdAt = updatedAt = new Date()

    return (connection, done) => connection.query({
        sql: `
INSERT INTO webhooks (
    id, address, topic, created_at, updated_at
)
VALUES (
    :hookId, :address, :topic, :createdAt, :updatedAt
);`
    },
    {
        hookId,
        address,
        topic,
        createdAt,
        updatedAt
    },
    (error, results, fields) => {
        return done(error, { hookId })
    })
}
