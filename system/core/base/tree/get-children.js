module.exports = (context) => {
    return (nodeId) => {
        const { db } = context

        let rslt = {}
        let memo = { nodeId }

        rslt = db.prepare(`
            SELECT
                node.root AS rootId
            FROM
                nodes AS node
            WHERE node.id = $nodeId
            LIMIT 1;
        `).get({
            nodeId: memo.nodeId
        })
        memo = _.extend({}, memo, rslt)

        rslt = db.prepare(`
            SELECT
                node.*
            FROM
                nodes AS node
            WHERE (
                node.parent = $parentId
                AND node.root = $rootId
            )
            ORDER BY node.left;
        `).all({
            rootId: memo.rootId,
            parentId: memo.nodeId,
        })

        return _.map(rslt, (o) => _.omit(o, 'nodeLevel'))
    }
}

// stmt = db.prepare(`
//     SELECT
//         node.*,
//         (
//           COUNT(parent.id) - (subTree.nLevel + 1)
//         ) AS nodeLevel
//     FROM
//         nodes AS node,
//         nodes AS parent,
//         nodes AS subParent
//     INNER JOIN (
//         SELECT
//             node.id,
//             (COUNT(parent.id) - 1) AS nLevel
//         FROM
//             nodes AS node,
//             nodes AS parent
//         WHERE (node.left BETWEEN parent.left AND parent.right)
//             AND node.id = $nodeId
//             AND node.root = $rootId
//             AND parent.root = $rootId
//         GROUP BY node.id
//         ORDER BY node.left
//     ) AS subTree
//     WHERE (node.left BETWEEN parent.left AND parent.right)
//         AND (node.left BETWEEN subParent.left AND subParent.right)
//         AND subParent.id = subTree.id
//         AND subParent.root = $rootId
//         AND node.root = $rootId
//         AND parent.root = $rootId
//     GROUP BY node.id
//     HAVING nodeLevel = 1
//     ORDER BY node.left;
// `)
