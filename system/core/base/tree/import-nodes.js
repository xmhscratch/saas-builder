module.exports = (context) => {
    return (plainNodes) => {
        const { db } = context

        db.exec('DELETE FROM nodes;')

        return _.map(plainNodes, (item) => {
            db.prepare(`
                INSERT INTO nodes (
                    id, root, parent, left, right, level
                ) VALUES (
                    $nodeId, $rootId, $parentId, $left, $right, $level
                )
            `).run({
                nodeId: item.id || item._id,
                rootId: item.root,
                parentId: item.parent,
                left: item.left,
                right: item.right,
                level: item.level,
            })
        })
    }
}
