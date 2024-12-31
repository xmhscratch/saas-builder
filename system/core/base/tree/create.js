const { ObjectId } = require('mongodb')

module.exports = (context) => {
    return (parentId) => {
        const { db } = context

        let rslt = {}
        let nodeId = ObjectId().toHexString()
        let memo = { nodeId, parentId }

        rslt = db.prepare(`
            SELECT
                node.root AS rootId
            FROM
                nodes AS node
            WHERE node.id = $parentId
            LIMIT 1;
        `).get({
            parentId: memo.parentId
        })
        memo = _.extend({}, memo, rslt)

        db.prepare(`
            INSERT INTO nodes (
                id, root, parent, left, right, level
            )
            VALUES (
                $nodeId, $rootId, $parentId, 0, 0, 0
            );
        `).run({
            nodeId: memo.nodeId,
            rootId: memo.rootId,
            parentId: memo.parentId,
        })

        rslt = db.prepare(`
            SELECT
                node.left AS nodeLeft,
                node.right AS nodeRight
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
                node.right AS parentRight
            FROM
                nodes AS node
            WHERE (
                node.id = $parentId
                AND node.root = $rootId
            )
            LIMIT 1;
        `).get({
            parentId: memo.parentId,
            rootId: memo.rootId
        })
        memo = _.extend({}, memo, rslt)

        db.prepare(`
            UPDATE nodes
            SET left = left + 2
            WHERE (
                left >= $parentRight
                AND root = $rootId
            );
        `).run({
            parentRight: memo.parentRight,
            rootId: memo.rootId
        })

        db.prepare(`
            UPDATE nodes
            SET right = right + 2
            WHERE (
                right >= $parentRight
                AND root = $rootId
            );
        `).run({
            parentRight: memo.parentRight,
            rootId: memo.rootId
        })

        db.prepare(`
            UPDATE nodes
            SET
                left = $parentRight,
                right = $parentRight + 1
            WHERE (
                id = $nodeId
                AND root = $rootId
            );
        `).run({
            parentRight: memo.parentRight,
            nodeId: memo.nodeId,
            rootId: memo.rootId
        })

        rslt = db.prepare(`
            SELECT
                node.id,
                (COUNT(parent.id) - 1) AS nodeLevel
            FROM
                nodes AS node,
                nodes AS parent
            WHERE (
                (node.left BETWEEN parent.left AND parent.right)
                AND node.id = $nodeId
                AND parent.root = node.root
            )
            GROUP BY node.id;
        `).get({
            nodeId: memo.nodeId
        })
        memo = _.extend({}, memo, rslt)

        db.prepare(`
            UPDATE nodes
            SET level = $nodeLevel
            WHERE (
                id = $nodeId
                AND root = $rootId
            );
        `).run({
            nodeLevel: memo.nodeLevel,
            nodeId: memo.nodeId,
            rootId: memo.rootId,
        })

        return { nodeId }
    }
}
