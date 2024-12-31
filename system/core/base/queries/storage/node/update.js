module.exports = async function (db, nodeId, {
    title,
    state,
    description,
}) {
    let queryString

    const vars = { title, state, description }

    let sqlUpdate = []
    _.forEach({
        title: 'title',
        state: 'state',
        description: 'description',
    }, (colName, valName) => {
        if (!_.isUndefined(vars[valName])) {
            sqlUpdate.push(`${colName} = :${valName}`)
        }
    })

    if (_.isEmpty(sqlUpdate)) {
        return {}
    }
    sqlUpdate = _.join(sqlUpdate, ',\n    ')

    queryString = `
UPDATE
    nodes
SET
    ${sqlUpdate},
    modified_at = CURRENT_TIMESTAMP
WHERE nodes.id = :nodeId;`

    return db
        .prepare(queryString)
        .run({ nodeId, ...vars })
}
