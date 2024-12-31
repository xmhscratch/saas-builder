module.exports = (context) => {
    return () => {
        const { db, rootId } = context

        let rslt = {}

        rslt = db.prepare(`
            SELECT
                node.*
            FROM nodes as node
            WHERE node.root = $rootId
            ORDER BY node.left;
        `).bind({
            rootId: rootId
        }).all()

        return rslt
    }
}
