const { TYPE_FILE, TYPE_FOLDER } = require('../enums/kind')

module.exports = async function (db, nodeId, kindFilter = [TYPE_FILE, TYPE_FOLDER]) {
    let queryString

    kindFilter = _.join(kindFilter, ', ')

    queryString = `
SELECT
    node._root AS rootId
FROM
    nodes AS node
WHERE node.id = :nodeId
LIMIT 1;`
    let nodeInfo = db
        .prepare(queryString)
        .get({ nodeId })

    const rootId = _.get(nodeInfo, 'rootId', null)

    queryString = `
SELECT
    node.id AS id,
    node.title AS title,
    node.kind AS kind,
    node.state AS state,
    node.description AS description,
    node.created_at AS createdAt,
    node.modified_at AS modifiedAt,
    node._root AS rootId,
    node._parent AS parentId,
    node._left AS left,
    node._right AS right,
    node._depth AS depth,
    node.id AS nodeId,
    file._node_id AS fileId,
    file.size AS fileSize,
    file.content_type AS fileContentType,
    file.extension AS fileExtension,
    file.thumbnail32 AS fileThumbnail32,
    file.thumbnail128 AS fileThumbnail128
FROM
    nodes AS node,
    nodes AS parent
LEFT JOIN
    files AS file ON file._node_id = node.id
WHERE (
        node._left BETWEEN parent._left AND parent._right
    )
    AND parent.id = :nodeId
    AND node.kind IN (${kindFilter})
    AND node._root = :rootId
ORDER BY
    node._left ASC;`

    return db
        .prepare(queryString)
        .all({ nodeId, rootId })
}
