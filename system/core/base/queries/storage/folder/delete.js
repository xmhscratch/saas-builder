const deleteNode = require('../node/delete')

module.exports = async function (db, folderId) {
    return deleteNode(db, folderId)
}
