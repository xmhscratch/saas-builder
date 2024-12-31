module.exports = async function (db, nodeId) {
    let queryString

    queryString = `
SELECT
    node.id AS nodeId,
    (COUNT(parent.id) - 1) as nodeDepth
FROM
    nodes AS node,
    nodes AS parent
WHERE (
    node._left BETWEEN parent._left AND parent._right
)
    AND node.id = :nodeId
    AND parent._root = node._root
GROUP BY node.id
LIMIT 1;`
    let nodeInfo = db
        .prepare(queryString)
        .get({ nodeId })

    return _.get(nodeInfo, 'nodeDepth', 0)
}
