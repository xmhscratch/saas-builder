module.exports = (context) => {
    return (nodeId) => {
        const { db, rootId } = context

        let rslt = {}

        rslt = db.prepare(`
            SELECT
                node.*
            FROM
                nodes AS node
            WHERE (
                node.id = $nodeId
                AND node.root = $rootId
            )
            LIMIT 1;
        `).get({
            nodeId: nodeId,
            rootId: rootId,
        })

        return rslt
    }
}
