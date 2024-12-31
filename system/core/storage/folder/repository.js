/**
 * Represents a user
 * @class Folder
 */
class Folders {

    constructor({ driveId }, { organizationId }) {
        this.driveId = driveId

        const { $qs } = global
        this.qs = $qs({ driveId }, { organizationId })

        return this
    }

    async createNew(parentId, { id, title, description, state, }) {
        const infoValues = { id, title, state, description }

        const nodeInfo = await this.qs
            .getFolder(parentId)
            .catch(handleError)

        const rootId = _.get(nodeInfo, 'rootId', null)
        if (_.isEmpty(rootId)) {
            return handleError('Root folder not found!')
        }

        const folderId = await this.qs
            .createFolder(parentId, rootId, infoValues, id)
            .catch(handleError)

        if (_.isEmpty(folderId)) {
            return handleError('Folder cannot be created')
        }

        return this.qs
            .getFolder(folderId)
            .catch(handleError)

        // return events('folder/create', connection, results)
        //     .then(() => )
    }

    async createRoot({ id, title, description, }) {
        let rootId = await this.qs
            .createRoot({ title, description }, id)
            .catch(handleError)

        if (_.isEmpty(rootId)) {
            rootId = id
        }

        return this.qs
            .getFolder(rootId)
            .catch(handleError)

        // return events('root/create', connection, results)
        //     .then(() => )
    }

    async getRootItems({ limit, offset, kind }) {
        return this.qs
            .getRootItems(
                kind || [1, 2],
                { limit, offset },
            )
            .catch(handleError)
    }
}

module.exports = Folders
