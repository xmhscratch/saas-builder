const updateNode = require('../node/update')

module.exports = async function (db, fileId, {
    title,
    description = null,
    state = 1,
    size,
    contentType,
    extension,
}) {
    let sqlUpdate = []
    const vars = { size, contentType, extension }

    _.forEach({
        size: 'size',
        contentType: 'content_type',
        extension: 'extension'
    }, (colName, valName) => {
        if (!_.isUndefined(vars[valName])) {
            sqlUpdate.push(`${colName} = :${valName}`)
        }
    })

    await updateNode(db, fileId, {
        title,
        description,
        state,
    })

    if (_.isEmpty(sqlUpdate)) {
        return {}
    }

    sqlUpdate = _.join(sqlUpdate, ',\n    ')

    let queryString = `
UPDATE files
SET ${sqlUpdate}
WHERE files._node_id = :fileId;`

    return db
        .prepare(queryString)
        .run({ fileId, ...vars })
}
