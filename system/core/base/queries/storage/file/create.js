const { TYPE_FILE } = require('../enums/kind')
const createNode = require('../node/create')

module.exports = async function (db, parentId, rootId, {
    title,
    description,
    state = 1,
    size = 0,
    contentType = 'application/octet-stream',
    extension = '.bin',
}, newId) {
    let queryString

    const nodeId = await createNode(db, parentId, rootId, {
        title,
        description,
        state,
        nodeKind: TYPE_FILE
    }, newId)

    if (!nodeId) {
        return null
    }

    queryString = `
INSERT OR IGNORE INTO files (
    _node_id, size, content_type, extension
)
VALUES (
    :nodeId, :size, :contentType, :extension
);`

    db
        .prepare(queryString)
        .run({ nodeId, size, contentType, extension })

    return nodeId
}
