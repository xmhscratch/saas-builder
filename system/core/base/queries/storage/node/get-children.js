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
    file._node_id AS nodeId,
    file.size AS fileSize,
    file.content_type AS fileContentType,
    file.extension AS fileExtension,
    file.thumbnail32 AS fileThumbnail32,
    file.thumbnail128 AS fileThumbnail128
FROM
    nodes AS node
LEFT JOIN
    files AS file ON file._node_id = node.id
WHERE (
    node._parent = :nodeId
    AND node._root = :rootId
    AND node.kind IN (${kindFilter})
)
ORDER BY
    node._left ASC;`

    return db
        .prepare(queryString)
        .all({ nodeId, rootId })
}

// `
// SELECT
//     node.id AS id,
//     node.title AS title,
//     node.kind AS kind,
//     node.state AS state,
//     node.description AS description,
//     node.created_at AS createdAt,
//     node.modified_at AS modifiedAt,
//     node._root AS rootId,
//     node._parent AS parentId,
//     node._left AS left,
//     node._right AS right,
//     node._depth AS depth,
//     (
//       COUNT(parent.id) - (subTree.depth + 1)
//     ) AS _depth
// FROM
//     nodes AS node,
//     nodes AS parent,
//     nodes AS subParent
// INNER JOIN (
//     SELECT
//         node.id,
//         (COUNT(parent.id) - 1) AS depth
//     FROM
//         nodes AS node,
//         nodes AS parent
//     WHERE (node._left BETWEEN parent._left AND parent._right)
//         AND node.id = :nodeId
//         AND node._root = :rootId
//         AND parent._root = :rootId
//     GROUP BY node.id
//     ORDER BY node._left
// ) AS subTree
// WHERE (node._left BETWEEN parent._left AND parent._right)
//     AND (node._left BETWEEN subParent._left AND subParent._right)
//     AND subParent.id = subTree.id
//     AND node.kind IN (${kindFilter})
//     AND subParent._root = :rootId
//     AND node._root = :rootId
//     AND parent._root = :rootId
// GROUP BY node.id
// HAVING node._depth = 1
// ORDER BY node._left;`
