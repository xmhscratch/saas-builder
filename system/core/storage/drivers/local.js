const Driver = require('./driver')

class LocalDriver extends Driver {

    async read() {
        const nodeFullPath = this.getPath()

        return new Promise((resolve, reject) => {
            $.fs.access(nodeFullPath, $.fs.constants.F_OK, (err) => {
                if (err) { return reject(err) }
                const readStream = $.fs.createReadStream(nodeFullPath)
                readStream.on('error', (err) => reject(err))
                return resolve(readStream)
            })
        })
    }

    async write(fileBuffer) {
        const nodeFullPath = this.getPath()
        const nodeFullPathFS = fs(nodeFullPath, { type: fs.TYPE_FILE })

        await nodeFullPathFS
            .write(fileBuffer, {
                encoding: 'binary',
                mode: parseInt('0744', 8) & ~process.umask()
            })
            .catch(handleError)

        return nodeFullPath
    }

    async delete() {
        const nodeFullPath = this.getPath()
        const nodeFullPathFS = fs(nodeFullPath, { type: fs.TYPE_FILE })
        try {
            await nodeFullPathFS
                .delete()
                .catch(handleError)
        } catch(error) {
            return handleError(error)
        }
        return nodeFullPath
    }
}

module.exports = LocalDriver
