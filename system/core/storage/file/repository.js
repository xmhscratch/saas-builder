const mime = require('mime')
// const { v4: uuidV4 } = require('uuid')

const StorageDriver = require('../drivers/local')

/**
 * Represents a user
 * @class File
 */
class Files {

    constructor({ driveId }, { organizationId }) {
        this.driveId = driveId
        this.organizationId = organizationId

        this.qs = $qs({ driveId }, { organizationId })

        return this
    }

    async upload(parentId, { fileName, fileBuffer }) {
        const { organizationId } = this
        const { driveId } = this

        const contentType = mime.getType(fileName)
        const extension = mime.getExtension(contentType)

        const size = (fileBuffer.length || 0)
        const title = String(fileName)

        const attrs = { title, size, contentType, extension }

        const nodeInfo = await this.qs
            .getFolder(parentId)
            .catch(handleError)

        const rootId = _.get(nodeInfo || {}, 'rootId', null)

        const fileId = await this.qs
            .createFile(parentId, rootId, attrs)
            .catch(handleError)

        if (!fileId) {
            return handleError('File cannot be created')
        }

        const storageDriver =  new StorageDriver({ fileId, driveId }, { organizationId })
        await storageDriver
            .write(fileBuffer)
            .catch(handleError)

        return this.qs
            .getFile(fileId)
            .catch(handleError)

        // return events('file/create', connection, results)
        //     .then(() => )
    }
}

module.exports = Files

// const createThumbnail = async (width, height) => {
//     const sourcePath = `/export/tmp/${uuidV4()}.bin`
//     const sourcePathFS = fs(sourcePath)
//     const writeAsyncPromise = Promise.promisify(
//         sourcePathFS.writeAsync.bind(sourcePathFS)
//     )
//     await writeAsyncPromise(fileBuffer, { encoding: null })

//     return new Promise((resolve, reject) => {
//         return request({
//             method: 'POST',
//             url: `http://${config('urls.cluster.thumbnail')}`,
//             qs: { width, height },
//             encoding: null,
//             formData: {
//                 'file': $.fs.createReadStream(sourcePath)
//             },
//         }, (error, resp, body) => {
//             if (error) {
//                 return reject(error)
//             }
//             return resolve(body)
//         })
//     })
// }

// switch (extension) {
//     case 'jpeg':
//     case 'jpg':
//     case 'png':
//         const thumb32Buffer = await createThumbnail(32, 32)
//         await this.qs.updateThumbnail32(fileId, thumb32Buffer)

//         const thumb128Buffer = await createThumbnail(128, 128)
//         await this.qs.updateThumbnail128(fileId, thumb128Buffer)

//         break;
//     default: break;
// }
