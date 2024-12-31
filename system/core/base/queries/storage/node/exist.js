module.exports = async function (db, nodeId) {
    let queryString

    queryString = `
SELECT
    COUNT(node.id) AS countNode
FROM
    nodes AS node
WHERE id = :nodeId
LIMIT 1;`
    let nodeInfo = db
        .prepare(queryString)
        .get({ nodeId })

    const countNode = _.get(nodeInfo, 'countNode', 0)
    return _.toNumber(countNode) > 0
}
