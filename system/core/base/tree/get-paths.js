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
                parent.*
            FROM
                nodes AS node,
                nodes AS parent
            WHERE (
                (node.left BETWEEN parent.left AND parent.right)
                AND node.id = $nodeId
                AND parent.root = $rootId
            )
            ORDER BY parent.left;
        `).bind({
            nodeId: memo.nodeId,
            rootId: memo.rootId
        }).all()

        return rslt
    }
}
