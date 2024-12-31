module.exports = async function (db, nodeId, parentId, adjacentId = null) {
    let queryString
// ==================================================
    queryString = `
SELECT
    node._root AS rootId,
    node._left AS nodeLeft,
    node._right AS nodeRight,
    node._depth AS nodeDepth,
    node.kind AS nodeKind,
    node._right - node._left + 1 AS nodeWidth
FROM
    nodes AS node
WHERE node.id = :nodeId
LIMIT 1;`
    let nodeInfo = db
        .prepare(queryString)
        .get({ nodeId })

    const rootId = _.get(nodeInfo, 'rootId', null)
    const nodeLeft = _.get(nodeInfo, 'nodeLeft', 0)
    const nodeRight = _.get(nodeInfo, 'nodeRight', 0)
    const nodeKind = _.toInteger(_.get(nodeInfo, 'nodeKind', 2))
    const nodeDepth = _.get(nodeInfo, 'nodeDepth', 0)
    const nodeWidth = _.get(nodeInfo, 'nodeWidth', 0)
// ==================================================
    queryString = `
SELECT
    node._root AS parentRoot,
    node._left AS parentLeft,
    node._right AS parentRight,
    node.kind AS parentKind,
    node._depth AS parentDepth
FROM
    nodes AS node
WHERE node.id = :parentId
LIMIT 1;`
    let parentInfo = db
        .prepare(queryString)
        .get({ parentId, rootId })

    const parentRoot = _.get(parentInfo, 'parentRoot', null)
    const parentLeft = _.get(parentInfo, 'parentLeft', 0)
    const parentRight = _.get(parentInfo, 'parentRight', 0)
    const parentKind = _.toInteger(_.get(parentInfo, 'parentKind', 2))
    const parentDepth = _.get(parentInfo, 'parentDepth', 0)

    const isMoveRejection = (
        // prevent node move to inside and to itself
        (
            _.lte(nodeLeft, parentLeft)
            && _.gte(nodeRight, parentRight)
        )
        // prevent move into file node
        || _.isEqual(parentKind, 1)
    )

    if (isMoveRejection) { return false }
// ==================================================
//     queryString = `
// SELECT
//     node._left AS adjacentLeft,
//     node._right AS adjacentRight
// FROM
//     nodes AS node
// WHERE node.id = :adjacentId
// AND node._root = :rootId
// LIMIT 1;`
    queryString = `
SELECT
    parent.id AS adjacentId,
    parent._left AS adjacentLeft,
    parent._right AS adjacentRight,
    parent._right AS newPosition
FROM
    nodes AS node,
    nodes AS parent
WHERE (
    node.id = :adjacentId
    AND node._left BETWEEN parent._left AND parent._right
    AND node._root = :rootId
    AND parent._depth = :parentDepth + 1
)
LIMIT 1;`
    let adjacentInfo = db
        .prepare(queryString)
        .get({ adjacentId, rootId, parentDepth })

    let newPosition = 0
    let adjacentLeft = _.get(adjacentInfo, 'adjacentLeft', 0)
    let adjacentRight = _.get(adjacentInfo, 'adjacentRight', 0)

    if (!adjacentId) {
        newPosition = parentLeft
    } else {
        newPosition = adjacentRight
    }
// ==================================================
    // temporary "remove" moving node
    queryString = `
UPDATE
    nodes
SET
    _left = 0 - nodes._left,
    _right = 0 - nodes._right
WHERE nodes._left >= :nodeLeft
    AND nodes._right <= :nodeRight
    AND nodes._root = :rootId;`
    db
        .prepare(queryString)
        .run({ nodeLeft, nodeRight, rootId })

    if (_.isEqual(rootId, parentRoot)) {
// ==================================================
        // decrease left and/or right position values of currently 'lower' items
        queryString = `
UPDATE 
    nodes
SET
    _left = nodes._left - :nodeWidth
WHERE nodes._left > :nodeRight
    AND nodes._root = :parentRoot;`
        db
            .prepare(queryString)
            .run({ nodeWidth, nodeRight, parentRoot })
// ==================================================
        queryString = `
UPDATE
    nodes
SET
    _right = nodes._right - :nodeWidth
WHERE nodes._right > :nodeRight
    AND nodes._root = :parentRoot;`
        db
            .prepare(queryString)
            .run({ nodeWidth, nodeRight, parentRoot })
// ==================================================
        // increase left and/or right position values of future 'lower' items
        queryString = `
UPDATE
    nodes
SET
    _left = nodes._left + :nodeWidth
WHERE (
    nodes._left > IIF(
        :newPosition > :nodeRight,
        :newPosition - :nodeWidth,
        :newPosition
    )
)
    AND nodes._root = :parentRoot;`
        db
            .prepare(queryString)
            .run({ nodeWidth, nodeRight, newPosition, parentRoot })
// ==================================================
        queryString = `
UPDATE
    nodes
SET
    _right = nodes._right + :nodeWidth
WHERE (
    nodes._right > IIF(
        :newPosition > :nodeRight,
        :newPosition - :nodeWidth,
        :newPosition
    )
)
    AND nodes._root = :parentRoot;`
        db
            .prepare(queryString)
            .run({ nodeWidth, nodeRight, newPosition, parentRoot })
    }
    else {
// ==================================================
        queryString = `
UPDATE
    nodes
SET
    _left = _left - :nodeWidth
WHERE nodes._left > :nodeRight
    AND nodes._root = :rootId;`
        db
            .prepare(queryString)
            .run({ nodeWidth, nodeRight, rootId })
// ==================================================
        queryString = `
UPDATE
    nodes
SET
    _right = _right - :nodeWidth
WHERE nodes._right > :nodeRight
    AND nodes._root = :rootId;`
        db
            .prepare(queryString)
            .run({ nodeWidth, nodeRight, rootId })
// ==================================================
        // decrease left and/or right position values of currently 'lower' items
        queryString = `
UPDATE 
    nodes
SET
    _left = nodes._left - :nodeWidth
WHERE nodes._left > :nodeRight
    AND nodes._root = :parentRoot;`
        db
            .prepare(queryString)
            .run({ nodeWidth, nodeRight, parentRoot })
// ==================================================
        queryString = `
UPDATE
    nodes
SET
    _right = nodes._right - :nodeWidth
WHERE nodes._right > :nodeRight
    AND nodes._root = :parentRoot;`
        db
            .prepare(queryString)
            .run({ nodeWidth, nodeRight, parentRoot })
// ==================================================
        // increase left and/or right position values of future 'lower' items
        queryString = `
UPDATE
    nodes
SET
    _left = nodes._left + :nodeWidth
WHERE (
    nodes._left > IIF(
        :newPosition > :nodeRight,
        :newPosition - :nodeWidth,
        :newPosition
    )
)
    AND nodes._root = :parentRoot;`
        db
            .prepare(queryString)
            .run({ nodeWidth, nodeRight, newPosition, parentRoot })
// ==================================================
        queryString = `
UPDATE
    nodes
SET
    _right = nodes._right + :nodeWidth
WHERE (
    nodes._right > IIF(
        :newPosition > :nodeRight,
        :newPosition - :nodeWidth,
        :newPosition
    )
)
    AND nodes._root = :parentRoot;`
        db
            .prepare(queryString)
            .run({ nodeWidth, nodeRight, newPosition, parentRoot })
    }
// ==================================================
    queryString = `
UPDATE
    nodes
SET
    _root = :parentRoot
WHERE nodes._left <= 0 - :nodeLeft
    AND nodes._right >= 0 - :nodeRight
    AND nodes._root = :rootId;`
    db
        .prepare(queryString)
        .run({ parentRoot, nodeLeft, nodeRight, rootId })
// ==================================================
    queryString = `
UPDATE
    nodes
SET
    _parent = :parentId
WHERE nodes.id = :nodeId;`
    db
        .prepare(queryString)
        .run({ parentId, nodeId })
// ==================================================
    // move node (ant it's subnodes)
    queryString = `
UPDATE
    nodes
SET
    _left = 0 - (nodes._left) + IIF(
        :newPosition > :nodeRight,
        :newPosition - :nodeRight,
        :newPosition - :nodeRight + :nodeWidth
    ),
    _right = 0 - (nodes._right) + IIF(
        :newPosition > :nodeRight,
        :newPosition - :nodeRight,
        :newPosition - :nodeRight + :nodeWidth
    ),
    _depth = _depth + (:parentDepth - (:nodeDepth - 1))
WHERE nodes._left <= 0 - :nodeLeft
    AND nodes._right >= 0 - :nodeRight;`
    db
        .prepare(queryString)
        .run({
            newPosition, nodeWidth, parentDepth,
            nodeDepth, nodeLeft, nodeRight, rootId
        })

    return true
}
