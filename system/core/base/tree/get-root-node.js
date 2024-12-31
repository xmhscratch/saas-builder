module.exports = (context) => {
    return () => {
        const { db, rootId } = context

        let rslt = {}

        rslt = db.prepare(`
            SELECT
                node.*
            FROM
                nodes AS node
            WHERE node.id = $nodeId
            LIMIT 1;
        `).get({
            nodeId: rootId
        })

        return rslt
    }
}
