const Node = require('../node/manager')

const StorageDriver = require('../drivers/local')

/**
 * Represents a user
 * @class File
 */
class File extends Node {

    constructor({ fileId, driveId }, { organizationId }) {
        super({ fileId, driveId }, { organizationId })

        this.fileId = fileId
        this.driveId = driveId
        this.organizationId = organizationId

        return this
    }

    async getInfo() {
        const { fileId } = this

        return this.qs
            .getFile(fileId)
            .catch(handleError)
    }

    async createReadStream() {
        const { organizationId } = this
        const { fileId, driveId } = this

        const storageDriver = new StorageDriver({ fileId, driveId }, { organizationId })
        return storageDriver
            .read()
            .catch(handleError)
    }

    async updateInfo({ title, description, state }) {
        const { fileId } = this
        const attrs = { title, description, state }

        await this.qs
            .updateFile(fileId, attrs)
            .catch(handleError)

        const results = await this.qs
            .getFile(fileId)
            .catch(handleError)

        // this.event.dispatch('file/change', { organizationId, driveId, fileId })
        return results
    }

    async rewrite(fileBuffer) {
        const { organizationId } = this
        const { fileId, driveId } = this

        const fileInfo = await this.qs
            .getFile(fileId)
            .catch(handleError)

        const size = fileBuffer.length || 0

        const storageDriver = new StorageDriver({ fileId, driveId }, { organizationId })
        await storageDriver
            .write(fileBuffer)
            .catch(handleError)

        await this.qs
            .updateFile(fileInfo.id, { size })
            .catch(handleError)

        const results = await this.qs
            .getFile(fileId)
            .catch(handleError)

        // this.event.dispatch('file/rewrite', { userId, organizationId, driveId, fileId })
        return results
    }

    async delete() {
        const { organizationId } = this
        const { fileId, driveId } = this

        const storageDriver = new StorageDriver({ fileId, driveId }, { organizationId })
        await storageDriver
            .delete()
            .catch(handleError)

        const results = await this.qs
            .deleteFile(fileId)
            .catch(handleError)

        // this.event.dispatch('file/delete', { userId, organizationId, driveId, fileId })
        return results
    }

    async moveTo(parentId, adjacentId) {
        // const { fileId, driveId } = this

        const results = await super
            .moveTo(parentId, adjacentId)
            .catch(handleError)

        // this.event.dispatch('file/move', { userId, organizationId, driveId, fileId, parentId, adjacentId })
        return results
    }
}

module.exports = File
