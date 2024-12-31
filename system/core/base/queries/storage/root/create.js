const createNode = require('../node/create')

module.exports = async function (db, {
    title,
    description = null,
}, newId) {
    let queryString

    const nodeId = await createNode(db, null, null, {
        title, description
    }, newId)

    if (!nodeId) {
        return null
    }

    queryString = `
INSERT OR IGNORE INTO folders (
    _node_id
)
VALUES (
    :nodeId
);`
    db
        .prepare(queryString)
        .run({ nodeId })

    return nodeId
}
