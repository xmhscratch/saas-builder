module.exports = (context) => {
    return (parentId, parentIndex) => {
        const { db, rootId } = context

        let rslt = {}

        rslt = db.prepare(`
            SELECT
                node.*,
                (
                    SELECT
                        COUNT(id)
                    FROM
                        nodes AS nthNode
                    WHERE (
                        nthNode.right < node.left
                        AND nthNode.parent = node.parent
                        AND nthNode.root = node.root
                    )
                ) AS parentIndex
            FROM
                nodes AS node
            WHERE (
                node.parent = $parentId
                AND node.root = $rootId
                AND parentIndex = $parentIndex
            )
            LIMIT 1;
        `).get({
            rootId: rootId,
            parentId: parentId,
            parentIndex: parentIndex,
        })

        return rslt
    }
}
