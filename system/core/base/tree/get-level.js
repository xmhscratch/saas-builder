module.exports = (context) => {
    return (nodeId) => {
        const { db } = context

        let rslt = {}
        rslt = db.prepare(`
            SELECT
                node.id AS id,
                (COUNT(parent.id) - 1) AS level
            FROM
                nodes AS node,
                nodes AS parent
            WHERE (
                node.id = $nodeId
                AND parent.root = node.root
                AND node.left BETWEEN parent.left AND parent.right
            )
            GROUP BY node.id
        `).get({ nodeId: nodeId })

        return !_.isEmpty(rslt) ? rslt.level : 0
    }
}
