module.exports = (context) => {
    return (nodeId) => {
        const { db } = context

        let rslt = {}
        let memo = {}

        rslt = db.prepare(`
            SELECT
                node.id AS nodeId,
                node.root AS rootId,
                node.left AS nodeLeft,
                node.right AS nodeRight,
                (node.right - node.left + 1) AS nodeWidth
            FROM
                nodes as node
            WHERE (
                node.id = $nodeId
                AND node.parent IS NOT NULL
            );
        `).get({ nodeId: nodeId })
        memo = _.extend({}, memo, _.chain(rslt).pickBy(_.identity).value())

        if (!memo.nodeId) {
            return t('cannot delete root block')
        }

        const targetNodes = context.getDescendants(memo.nodeId)
        memo = _.extend({}, memo, { targetNodes })

        const nodeIds = _.map(targetNodes, 'id')

        _.forEach(nodeIds, (nodeId) => {
            db.prepare(`
                DELETE FROM nodes
                WHERE id = $nodeId;
            `).run({ nodeId })
        })

        db.prepare(`
            DELETE FROM nodes
            WHERE (
                left BETWEEN $nodeLeft AND $nodeRight
            )
            AND root = $rootId;
        `).run({
            nodeLeft: memo.nodeLeft,
            nodeRight: memo.nodeRight,
            rootId: memo.rootId
        })

        db.prepare(`
            UPDATE
                nodes
            SET
                left = left - $nodeWidth
            WHERE left > $nodeRight
                AND root = $rootId;
        `).run({
            nodeWidth: memo.nodeWidth,
            nodeRight: memo.nodeRight,
            rootId: memo.rootId,
        })

        db.prepare(`
            UPDATE
                nodes
            SET
                right = right - $nodeWidth
            WHERE right > $nodeRight
                AND root = $rootId;
        `).run({
            nodeWidth: memo.nodeWidth,
            nodeRight: memo.nodeRight,
            rootId: memo.rootId,
        })

        return null
    }
}
