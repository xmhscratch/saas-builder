module.exports = async function (db, nodeId) {
    let queryString

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
    parent.id AS id,
    parent.title AS title,
    parent.kind AS kind,
    parent.state AS state,
    parent.description AS description,
    parent.created_at AS createdAt,
    parent.modified_at AS modifiedAt,
    parent._root AS rootId,
    parent._parent AS parentId,
    parent._left AS left,
    parent._right AS right,
    parent._depth AS depth
FROM
    nodes AS node,
    nodes AS parent
WHERE (
    node._left BETWEEN parent._left AND parent._right
)
    AND node.id = :nodeId
    AND parent._root = :rootId
ORDER BY
    parent._left ASC;`

    return db
        .prepare(queryString)
        .all({ nodeId, rootId })
}
