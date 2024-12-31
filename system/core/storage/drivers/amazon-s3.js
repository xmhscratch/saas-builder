const Driver = require('./driver')

class AmazonS3Driver extends Driver {

    async read() {
        // const nodeFullPath = this.getPath()
        // return $.fs.createReadStream(nodeFullPath)
    }

    async write(fileBuffer) {
        // const nodeFullPath = this.getPath()
        // const nodeFullPathFS = fs(nodeFullPath, { type: fs.TYPE_FILE })
        // const writeAsyncPromise = Promise.promisify(
        //     nodeFullPathFS.writeAsync.bind(nodeFullPathFS)
        // )
        // await writeAsyncPromise(fileBuffer, {
        //     encoding: 'binary',
        //     mode: parseInt('0744', 8) & ~process.umask()
        // }).catch(handleError)
        // return nodeFullPath
    }

    async delete() {
        // const nodeFullPath = this.getPath()
        // const nodeFullPathFS = fs(nodeFullPath, { type: fs.TYPE_FILE })
        // try {
        //     const deleteAsyncPromise = Promise.promisify(
        //         nodeFullPathFS.deleteAsync.bind(nodeFullPathFS)
        //     )
        //     await deleteAsyncPromise().catch(handleError)
        // } catch(error) {
        //     return handleError(error)
        // }
        // return nodeFullPath
    }
}

module.exports = AmazonS3Driver
