module.exports = async function (db) {
    let queryString

    queryString = `
SELECT
    COUNT(CASE WHEN node.kind = 1 THEN 1 ELSE NULL END) AS fileCount,
    COUNT(CASE WHEN node.kind = 2 THEN 1 ELSE NULL END) AS folderCount,
    SUM(file.size) AS diskUsed
FROM
    nodes AS node
LEFT JOIN
    files AS file ON file._node_id = node.id
LIMIT 1;`

    return db
        .prepare(queryString)
        .get()
}
