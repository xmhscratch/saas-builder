module.exports = async function (db, fileId) {
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
    file._node_id AS nodeId,
    file.size AS fileSize,
    file.content_type AS fileContentType,
    file.extension AS fileExtension,
    file.thumbnail32 AS fileThumbnail32,
    file.thumbnail128 AS fileThumbnail128
FROM
    files AS file
LEFT JOIN
    nodes AS node ON node.id = file._node_id
WHERE file._node_id = :fileId
LIMIT 1;`

    return db
        .prepare(queryString)
        .get({ fileId })
}
