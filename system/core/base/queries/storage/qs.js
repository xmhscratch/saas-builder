const Database = require('better-sqlite3')

const setupNewDb = require('./setup')

const openDb = ({ driveId }, { organizationId }) => {
    let db

    const storageDirPath = config('system.storageDirPath')
    const databaseDirPath = $.path.normalize(`${storageDirPath}/drives/${driveId.substring(0,8)}/${driveId.substring(9)}`)
    const databaseFilePath = $.path.normalize(`${databaseDirPath}/data.sqlite3`)

    try {
        db = new Database(databaseFilePath, {
            fileMustExist: true,
        })
    } catch (error) {
        fs(databaseFilePath).writeSync(Buffer.from([]), {})

        db = new Database(databaseFilePath, {
            fileMustExist: true,
        })

        setupNewDb(db)
    }

    return db
}

module.exports = ({ driveId }, { organizationId }) => {
    const _resultWrapper = (funcPath, ...args) => {
        return new Promise(async (resolve, reject) => {
            let results, db

            if (!db || !db.open) {
                db = openDb({ driveId }, { organizationId })
            }
            results = await require(funcPath)(db, ...args)
            db.close()

            if (!results) {
                return resolve({})
            }

            if (_.isArray(results)) {
                results = _.map(results, (o) => ({ ...o, driveId, organizationId }))
            }
            else if (_.isObject(results)) {
                results = { ...results, driveId, organizationId }
            }
            else { }

            return resolve(results)
        })
    }

    return {
        createRoot: (...args) => _resultWrapper('./root/create', ...args),
        getRootItems: (...args) => _resultWrapper('./root/get-items', ...args),

        createFile: (...args) => _resultWrapper('./file/create', ...args),
        deleteFile: (...args) => _resultWrapper('./file/delete', ...args),
        getFile: (...args) => _resultWrapper('./file/get', ...args),
        updateFile: (...args) => _resultWrapper('./file/update', ...args),
        updateThumbnail32: (...args) => _resultWrapper('./file/thumbnail32', ...args),
        updateThumbnail128: (...args) => _resultWrapper('./file/thumbnail128', ...args),

        createFolder: (...args) => _resultWrapper('./folder/create', ...args),
        deleteFolder: (...args) => _resultWrapper('./folder/delete', ...args),
        getFolder: (...args) => _resultWrapper('./folder/get', ...args),
        updateFolder: (...args) => _resultWrapper('./folder/update', ...args),

        getStats: (...args) => _resultWrapper('./node/stats', ...args),

        _createNode: (...args) => _resultWrapper('./node/create', ...args),
        _deleteNode: (...args) => _resultWrapper('./node/delete', ...args),
        _isNodeExist: (...args) => _resultWrapper('./node/exist', ...args),
        _getNodeChildren: (...args) => _resultWrapper('./node/get-children', ...args),
        _getNodeDepth: (...args) => _resultWrapper('./node/get-depth', ...args),
        _getNodeDescendants: (...args) => _resultWrapper('./node/get-descendants', ...args),
        _getNodePaths: (...args) => _resultWrapper('./node/get-paths', ...args),
        _getNode: (...args) => _resultWrapper('./node/get', ...args),
        _moveNodeToNode: (...args) => _resultWrapper('./node/move', ...args),
        _updateNode: (...args) => _resultWrapper('./node/update', ...args),
    }
}

// sqlite_web --port=8085 --host=0.0.0.0 --no-browser /home/web/data/system/drives/35c0eafc/bac8-50e4-95da-99e161f53101/data.sqlite3
