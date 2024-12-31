const { TYPE_FOLDER } = require('../enums/kind')
const createNode = require('../node/create')

module.exports = async function (db, parentId, rootId, {
    title,
    description,
    state = 1,
}, newId) {
    let queryString

    const nodeId = await createNode(db, parentId, rootId, {
        title,
        description,
        state,
        nodeKind: TYPE_FOLDER
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
