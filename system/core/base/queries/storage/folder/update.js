const updateNode = require('../node/update')

module.exports = async function (db, folderId, {
    title,
    description = null,
    state = 1,
}) {
    // const sqlUpdate = []
    // const vars = { size, contentType, extension }

    // _.forEach({
    //     size: 'size',
    //     contentType: 'content_type',
    //     extension: 'extension'
    // }, (colName, valName) => {
    //     if (!_.isUndefined(vars[valName])) {
    //         sqlUpdate.push(`${colName} = :${valName}`)
    //     }
    // })

    // if (_.isEmpty(sqlUpdate)) {
    //     return done(null, {})
    // }

    // sqlUpdate = _.join(sqlUpdate, ',\n    ')

    // db.prepare(`
    // UPDATE
    //     folders
    // SET
    //     ${sqlUpdate}
    // WHERE folder._node_id = :folderId;`
    // ).run({ folderId, ...vars })

    return updateNode(db, folderId, {
        title,
        description,
        state,
    })
}
