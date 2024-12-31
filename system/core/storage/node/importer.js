const { v4: uuidV4 } = require('uuid')
const StateFlow = require('state-flow')

/**
 * Represents a user
 * @class Theme
 */
class Importer {

    /**
     * Gets all users
     * @method Router#updateLayout
     */
    constructor({ basePath, folderId, tenantId, domainId }, { organizationId }) {
        this.basePath = basePath
        this.folderId = folderId

        this.tenantId = tenantId
        this.domainId = domainId

        this.rootKey = uuidV4()

        this.flow = new StateFlow((item, done) => {
            let key = item.getStateKey()
            let data = item.getStateData()

            return request(data, (error, response, { results }) => {
                if (error) {
                    return done(error)
                }
                return done(error, results)
            })
        })

        this.items = {}
        this.states = {}

        return this
    }

    /**
     * Gets all users
     * @method Router#updateLayout
     */
    addFiles(filePaths, folderPath) {
        let revFolderPath = $.path.relative(
            this.basePath, folderPath
        )

        if (!_.isEmpty(revFolderPath)) {
            let itemId = uuidV4()

            this.items[itemId] = {
                id: itemId,
                path: revFolderPath,
                type: 'folder',
                name: $.path.basename(revFolderPath)
            }
        }

        _.forEach(filePaths, (filePath, key) => {
            let revFilePath = $.path.relative(
                this.basePath, filePath
            )
            if (_.isEmpty(revFilePath)) return

            let itemId = uuidV4()
            this.items[itemId] = {
                id: itemId,
                path: revFilePath,
                type: 'file',
                name: $.path.basename(revFilePath),
                source: filePath
            }
        })
    }

    /**
     * Gets all users
     * @method Router#updateLayout
     */
    createStates() {
        const { tenantId } = this
        const { rootKey } = this

        this.items = _.mapValues(this.items, (item) => {
            let parentPath = $.path.dirname(item.path)
            let parentNode = _.find(this.items, {
                type: 'folder',
                path: parentPath
            })
            let parentKey = _.result(parentNode, 'id', rootKey)

            item.parent = parentKey
            return item
        })

        const { folderId } = this
        if (folderId) {
            this.states[rootKey] = this.flow.add(rootKey, {
                'baseUrl': appl.config.get('urls.api'),
                'method': 'GET',
                'uri': `/folders/get/${folderId}`,
                'json@boolean': 'true',
                'headers': {
                    'X-Tenant-ID': `${tenantId}`
                }
            })
        } else {
            this.states[rootKey] = this.flow.add(rootKey, {
                'baseUrl': appl.config.get('urls.api'),
                'method': 'GET',
                'uri': '/root/theme/get',
                'json@boolean': 'true',
                'headers': {
                    'X-Tenant-ID': `${tenantId}`
                }
            })
        }

        _.forEach(this.items, (item, key) => {
            if (_.isEqual(item.type, 'folder')) {
                this.states[item.id] = this.flow.add(item.id, {
                    'baseUrl': appl.config.get('urls.api'),
                    'method': 'POST',
                    'uri': `/folders/create/{{ ${item.parent}.id }}`,
                    'json@boolean': 'true',
                    'timeout@integer': '15000',
                    'form': {
                        'title': item.name
                    },
                    'headers': {
                        'X-Tenant-ID': `${tenantId}`
                    }
                })
                return
            }

            if (_.isEqual(item.type, 'file')) {
                this.states[item.id] = this.flow.add(item.id, {
                    'baseUrl': appl.config.get('urls.api'),
                    'method': 'POST',
                    'uri': `/files/upload/{{ ${item.parent}.id }}`,
                    'json@boolean': 'true',
                    'timeout@integer': '15000',
                    'formData': {
                        'file@raw': $.fs.createReadStream(item.source)
                    },
                    'headers': {
                        'X-Tenant-ID': `${tenantId}`
                    }
                })
                return
            }
        })

        _.forEach(this.items, (item, key) => {
            let itemNode = this.states[item.id]
            let parentNode = this.states[item.parent]

            itemNode.depend(parentNode)
        })
    }

    /**
     * Gets all users
     * @method Router#updateLayout
     */
    async run() {
        this.createStates()

        return new Promise((resolve, reject) => {
            return this.flow.fetch((error, results) => {
                if (error) {
                    return reject(error)
                }

                const dataResult = results

                results = _.transform(this.items, (memo, item, key) => {
                    return memo[
                        $.path.resolve('/', item.path)
                    ] = _.get(dataResult[key], 'id')
                }, {})

                return resolve(results)
            })
        }).catch(handleError)
    }
}

module.exports = Importer
