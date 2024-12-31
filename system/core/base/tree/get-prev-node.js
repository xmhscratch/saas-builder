module.exports = (context) => {
    return (nodeId) => {
        const { db, rootId } = context

        const nodeInfo = context.getNode(nodeId)
        const prevNodeParent = nodeInfo.parent
        const prevNodeRight = nodeInfo.left - 1

        let rslt = {}

        rslt = db.prepare(`
            SELECT node.*
            FROM nodes as node
            WHERE node.root = $rootId
                AND node.right = $prevNodeRight
                AND node.parent = $prevNodeParent
            LIMIT 1;
        `).get({
            rootId: rootId,
            prevNodeParent: prevNodeParent,
            prevNodeRight: prevNodeRight,
        })

        return rslt
    }
}
