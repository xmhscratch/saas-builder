const Node = require('../node/manager')

const StorageDriver = require('../drivers/local')

/**
 * Represents a user
 * @class Folder
 */
class Folder extends Node {

    constructor({ folderId, driveId }, { organizationId }) {
        super({ folderId, driveId }, { organizationId })

        this.folderId = folderId
        return this
    }

    async getInfo() {
        const { folderId } = this

        return this.qs
            .getFolder(folderId)
            .catch(handleError)
    }

    async updateInfo({ title, state, labels, description }) {
        const { folderId } = this
        const attrs = { title, state, description }

        await this.qs
            .updateFolder(folderId, attrs)
            .catch(handleError)

        return this.qs
            .getFolder(folderId)
            .catch(handleError)
    }

    async delete() {
        const { organizationId } = this
        const { driveId, folderId } = this

        const results = await this.qs
            .deleteFolder(folderId)
            .catch(handleError)

        const files = results.files || []
        await Promise
            .map(files, (fileInfo) => {
                const fileId = fileInfo.nodeId

                const storageDriver = new StorageDriver({ fileId, driveId }, { organizationId })
                return storageDriver
                    .delete()
                    .catch(handleError)
            })
            .catch(handleError)

        return results
    }

    async moveTo(parentId, adjacentId) {
        return super
            .moveTo(parentId, adjacentId)
            .catch(handleError)
    }

    async getChildren(kind = [1, 2]) {
        const folderInfo = await this
            .getInfo()
            .catch(handleError)

        const { nodeId } = folderInfo

        return this.qs
            ._getNodeChildren(nodeId, kind)
            .catch(handleError)
    }

    async getDescendants(kind = [1, 2]) {
        const folderInfo = await this
            .getInfo()
            .catch(handleError)

        const { nodeId } = folderInfo

        return this.qs
            ._getNodeDescendants(nodeId, kind)
            .catch(handleError)
    }
}

module.exports = Folder
