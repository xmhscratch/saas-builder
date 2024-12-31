const { v4: uuidV4 } = require('uuid')

const { TYPE_FILE, TYPE_FOLDER } = require('../enums/kind')

module.exports = async function (db, parentId, rootId, {
    title,
    description = null,
    state = 1,
    nodeKind = TYPE_FOLDER
}, newId) {
    const nodeId = newId || uuidV4()

    let queryString = `
SELECT
    node._root AS rootId,
    node._parent AS parentId
FROM
    nodes AS node
WHERE node.id = :parentId
LIMIT 1;`

    let nodeInfo = db
        .prepare(queryString)
        .get({ parentId, rootId })

    if (!nodeInfo) {
        rootId = nodeId
        parentId = null
    }

    queryString = `
INSERT OR IGNORE INTO nodes (
    id, title, kind, state, description,
    created_at, modified_at,
    _root, _parent, _left, _right, _depth
)
VALUES (
    :id, :title, :kind, :state, :description,
    CURRENT_TIMESTAMP, CURRENT_TIMESTAMP,
    :rootId, :parentId, 0, 0, 0
);`
    const insertResult = db
        .prepare(queryString)
        .run({
            id: nodeId,
            kind: nodeKind,
            title, state, description,
            rootId, parentId,
        })

    if (!insertResult || insertResult.lastInsertRowid < 1) {
        return null
    }

    queryString = `
UPDATE
    nodes
SET
    _root = :rootId,
    _parent = :parentId
WHERE nodes.id = :nodeId;`
    db
        .prepare(queryString)
        .run({ nodeId, rootId, parentId })

    queryString = `
SELECT
    node._left AS nodeLeft,
    node._right AS nodeRight
FROM
    nodes AS node
WHERE node.id = :nodeId
    AND node._root = :rootId
LIMIT 1;`
    nodeInfo = db
        .prepare(queryString)
        .get({ nodeId, rootId })

    let nodeLeft = _.get(nodeInfo, 'nodeLeft', 0)
    let nodeRight = _.get(nodeInfo, 'nodeRight', 0)

    queryString = `
SELECT
    node._right AS parentRight
FROM
    nodes AS node
WHERE node.id = :parentId
    AND node._root = :rootId
LIMIT 1;`
    nodeInfo = db
        .prepare(queryString)
        .get({ rootId, parentId })

    let parentRight = _.get(nodeInfo, 'parentRight', 0)
    if (!parentId) {
        parentRight = 1
    }

    queryString = `
UPDATE
    nodes
SET
    _left = _left + 2
WHERE nodes._left >= :parentRight
    AND nodes._root = :rootId;`
    db
        .prepare(queryString)
        .run({ rootId, parentRight })

    queryString = `
UPDATE
    nodes
SET
    _right = _right + 2
WHERE nodes._right >= :parentRight
    AND nodes._root = :rootId;`
    db
        .prepare(queryString)
        .run({ rootId, parentRight })

    queryString = `
UPDATE
    nodes
SET
    _left = :parentRight,
    _right = :parentRight + 1
WHERE nodes.id = :nodeId
    AND nodes._root = :rootId;`
    db
        .prepare(queryString)
        .run({ nodeId, rootId, parentRight })

    queryString = `
SELECT
    node.id,
    (COUNT(parent.id) - 1) as nodeDepth
FROM
    nodes AS node,
    nodes AS parent
WHERE (
    node._left BETWEEN parent._left AND parent._right
)
    AND node.id = :nodeId
    AND node._root = :rootId
    AND parent._root = node._root
GROUP BY node.id;`
    nodeInfo = db
        .prepare(queryString)
        .get({ nodeId, rootId })

    let nodeDepth = _.get(nodeInfo, 'nodeDepth', 0)

    queryString = `
UPDATE
    nodes
SET
    _depth = :nodeDepth
WHERE nodes.id = :nodeId
    AND nodes._root = :rootId;`
    db
        .prepare(queryString)
        .run({ nodeId, rootId, nodeDepth })

    return nodeId
}
