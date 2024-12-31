const deleteNode = require('../node/delete')

module.exports = async function (db, fileId) {
    return deleteNode(db, fileId)
}
