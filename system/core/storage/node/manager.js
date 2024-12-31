// const tar = require('tar')
// const tmp = require('tmp')
// const Importer = require('./importer')
// const StorageDriver = require('../../drivers/local')

/**
 * Represents a user
 * @class Node
 */
class Node {

    constructor({ nodeId, driveId }, { organizationId }) {
        const { $qs } = global

        this.nodeId = nodeId
        this.driveId = driveId
        this.organizationId = organizationId

        this.qs = $qs({ driveId }, { organizationId })
        return this
    }

    async moveTo(parentId, adjacentId) {
        const { nodeId } = this

        return this.qs
            ._moveNodeToNode(nodeId, parentId, adjacentId)
            .catch(handleError)
    }

    async getDepth() {
        const { nodeId } = this

        return this.qs
            ._getNodeDepth(nodeId)
            .catch(handleError)
    }

    async getPaths() {
        const { nodeId } = this

        return this.qs
            ._getNodePaths(nodeId)
            .catch(handleError)
    }
}

module.exports = Node

// /**
//  * Gets all users
//  * @method Router#updateLayout
//  */
// static import(folderId, buffer, done) {
//     tmp.file({
//         postfix: '.tar.gz'
//     }, (error, filePath, fd, cleanupCallback) => {
//         if (error) {
//             return done(error)
//         }

//         $.fs.writeFile(filePath, buffer, (error) => {
//             if (error) {
//                 return done(error)
//             }

//             tmp.dir((error, dirPath, cleanupCallback) => {
//                 if (error) {
//                     return done(error)
//                 }

//                 tar.extract({
//                     cwd: dirPath,
//                     file: filePath,
//                 }).then(() => {
//                     let list = __(dirPath).getItems()

//                     let basePath = dirPath
//                     let importer = new Importer({
//                         basePath, folderId, tenantId
//                     })
//                     _.forEach(list, importer.addFiles.bind(importer))

//                     return importer.run((error, results) => {
//                         // cleanupCallback()
//                         return done(error, results)
//                     })
//                 })
//                     .catch(error => {
//                         return done(error)
//                     })
//             })
//         })
//     })
// }

// /**
//  * Gets all users
//  * @method Router#updateLayout
//  */
// static export(done) {
//     const { connection } = this

//     tar.c({
//         gzip: true
//     }, [
//             'some', 'files', 'and', 'folders'
//         ]).pipe(fs.createWriteStream('my-tarball.tgz'))
// }
