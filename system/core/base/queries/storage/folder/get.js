module.exports = async function (db, folderId) {
    let queryString = `
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
    folder._node_id AS nodeId
FROM
    folders AS folder
LEFT JOIN
    nodes AS node ON node.id = folder._node_id
WHERE folder._node_id = :folderId
LIMIT 1;`

    return db
        .prepare(queryString)
        .get({ folderId })
}
