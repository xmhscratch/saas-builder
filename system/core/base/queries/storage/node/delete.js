const { TYPE_FILE, TYPE_FOLDER } = require('../enums/kind')

module.exports = async function (db, nodeId) {
    let queryString

    queryString = `
SELECT
    node._root AS rootId,
    node._left AS nodeLeft,
    node._right AS nodeRight,
    (node._right - node._left + 1) AS nodeWidth
FROM
    nodes as node
WHERE node.id = :nodeId
LIMIT 1;`
    let nodeInfo = db
        .prepare(queryString)
        .get({ nodeId })

    const rootId = _.get(nodeInfo, 'rootId', null)
    const nodeLeft = _.get(nodeInfo, 'nodeLeft', 0)
    const nodeRight = _.get(nodeInfo, 'nodeRight', 0)
    const nodeWidth = _.get(nodeInfo, 'nodeWidth', 0)

    queryString = `
SELECT
    node.id AS nodeId,
    node.kind AS nodeKind 
FROM
    nodes AS node
WHERE (
        node._left BETWEEN :nodeLeft AND :nodeRight
    )
    AND node._root = :rootId
ORDER BY node._left;`
    nodeInfo = db
        .prepare(queryString)
        .all({ rootId, nodeLeft, nodeRight })

    const results = _.chain(nodeInfo)
        .groupBy((v, k) => v.nodeKind)
        .mapKeys((v, k) => _.get({
            [TYPE_FILE]: 'files',
            [TYPE_FOLDER]: 'folders',
        }, k))
        .value()

    const { files, folders } = results

    _.forEach(files, (node) => {
        if (!node) return

        queryString = `
DELETE FROM files
WHERE files._node_id = :nodeId;`
        const { nodeId } = node
        db
            .prepare(queryString)
            .run({ nodeId })
    })

    _.forEach(folders, (node) => {
        if (!node) return

        const { nodeId } = node
        queryString = `
DELETE FROM folders
WHERE folders._node_id = :nodeId;`
        db
            .prepare(queryString)
            .run({ nodeId })
    })

    queryString = `
DELETE FROM nodes
WHERE (
        nodes._left BETWEEN :nodeLeft AND :nodeRight
    )
    AND nodes._root = :rootId;`
    db
        .prepare(queryString)
        .run({ rootId, nodeLeft, nodeRight })

    queryString = `
UPDATE
    nodes
SET
    _left = _left - :nodeWidth
WHERE nodes._left > :nodeRight
    AND nodes._root = :rootId;`
    db
        .prepare(queryString)
        .run({ rootId, nodeWidth, nodeRight })

    queryString = `
UPDATE
    nodes
SET
    _right = _right - :nodeWidth
WHERE nodes._right > :nodeRight
    AND nodes._root = :rootId;`
    db
        .prepare(queryString)
        .run({ rootId, nodeWidth, nodeRight })

    return results
}
