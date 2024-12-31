module.exports = (context) => {
    return (nodeId) => {
        const { db, rootId } = context

        let rslt = {}

        rslt = db.prepare(`
            SELECT
                node.id,
                MAX(node.level - parent.level) AS depth
            FROM
                nodes AS node,
                nodes AS parent
            WHERE (
                    node.left BETWEEN parent.left
                    AND parent.right
                )
                AND parent.id = $nodeId
                AND node.root = $rootId
            ORDER BY node.left;
        `).get({
            nodeId: nodeId,
            rootId: rootId
        })

        return !_.isEmpty(rslt) ? rslt.depth : 0
    }
}
