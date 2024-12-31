const { TYPE_FILE, TYPE_FOLDER } = require('../enums/kind')

module.exports = async function (db, kindFilter = [TYPE_FILE, TYPE_FOLDER], { limit = 20, offset = 0 }) {
    let queryString

    kindFilter = _.join(kindFilter, ', ')

    queryString = `
SELECT
    COUNT(*) AS count,
    (
        COUNT(parent.id) - (subTree.depth + 1)
    ) AS _depth
FROM
    nodes AS node,
    nodes AS parent,
    nodes AS subParent
INNER JOIN (
    SELECT
        node.id,
        (COUNT(parent.id) - 1) AS depth
    FROM
        nodes AS node,
        nodes AS parent
    WHERE (node._left BETWEEN parent._left AND parent._right)
    GROUP BY node.id
    ORDER BY node._left
) AS subTree
WHERE (node._left BETWEEN parent._left AND parent._right)
    AND (node._left BETWEEN subParent._left AND subParent._right)
    AND subParent.id = subTree.id
    AND node.kind IN (${kindFilter})
GROUP BY node.id
HAVING node._depth = 0
ORDER BY node._left;`
    const countResult = db
        .prepare(queryString)
        .get()

    const count = _.get(countResult, 'count', 0)

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
    file.extension AS fileExtension
FROM
    nodes AS node,
    nodes AS parent,
    nodes AS subParent
INNER JOIN (
    SELECT
        node.id,
        (COUNT(parent.id) - 1) AS depth
    FROM
        nodes AS node,
        nodes AS parent
    WHERE (node._left BETWEEN parent._left AND parent._right)
    GROUP BY node.id
    ORDER BY node._left
) AS subTree
LEFT JOIN
    files AS file ON file._node_id = node.id
WHERE (node._left BETWEEN parent._left AND parent._right)
    AND (node._left BETWEEN subParent._left AND subParent._right)
    AND subParent.id = subTree.id
    AND node.kind IN (${kindFilter})
GROUP BY node.id
HAVING node._depth = 0
ORDER BY node._left ASC
LIMIT :limit
OFFSET :offset;`
    const rows = db
        .prepare(queryString)
        .all({ limit, offset })

    return { count, rows }
}
