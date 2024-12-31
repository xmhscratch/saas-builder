class Driver {

    constructor({ fileId, driveId }, { organizationId }) {
        this.fileId = fileId
        this.driveId = driveId
        this.organizationId = organizationId

        return this
    }

    async read() { }
    async write() { }
    async delete() { }

    getPath() {
        const { fileId } = this

        const driveDirPath = this.getDriveDirPath()

        let fileDirSplits = _.split(fileId, '-')
        let filePath = _.join(_.initial(fileDirSplits), '/')
        let fileName = _.last(fileDirSplits)

        return fs(driveDirPath, filePath, `${fileName}.bin`).getFullPath()
    }

    getDriveDirPath() {
        const { driveId } = this

        const storageDirPath = config('system.storageDirPath')
        const baseDirPath = `${storageDirPath}/drives/${driveId.substring(0, 8)}/${driveId.substring(9)}`

        return fs(baseDirPath).getFullPath()
    }
}

module.exports = Driver
