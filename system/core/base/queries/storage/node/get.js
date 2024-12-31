module.exports = async function (db, nodeId) {
    let queryString

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
WHERE
    node.id = :nodeId
ORDER BY
    node._left ASC
LIMIT 1;`

    return db
        .prepare(queryString)
        .get({ nodeId })
}
