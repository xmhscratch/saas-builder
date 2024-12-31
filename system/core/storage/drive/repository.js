const { v4: uuidV4, v5: uuidV5 } = require('uuid')

const TenantRecord = require('../../core/tenant-record')

class Drives extends TenantRecord {

    constructor({ organizationId }) {
        super(organizationId)
        return this
    }

    async createNew({ title = '', description = '', readOnly = false }) {
        const { organizationId } = this

        const member = await Drives
            .getTenant(organizationId)
            .catch(handleError)

        const driveId = uuidV4()

        const { Drive } = member.tables
        const { driveModel, isCreated } = await Drive
            .findOrCreate({
                where: { id: driveId },
                defaults: $.Storage.Drive.parseValues({
                    id: driveId,
                    title, description, readOnly,
                    organizationId,
                })
            })
            .spread((driveModel, isCreated) => {
                return { driveModel, isCreated }
            })
            .catch(handleError)

        if (!driveModel) {
            return handleError('Cannot create drive')
        }

        return driveModel.get({ plain: true })
    }

    async setupNew() {
        const { organizationId } = this

        const member = await Drives
            .getTenant(organizationId)
            .catch(handleError)

        const driveId = uuidV5('system', organizationId)

        const { Drive } = member.tables
        const { driveModel, isCreated } = await Drive
            .findOrCreate({
                where: { isSystem: true },
                defaults: $.Storage.Drive.parseValues({
                    id: driveId,
                    title: 'System', description: '', readOnly: false,
                    organizationId,
                })
            })
            .spread((driveModel, isCreated) => {
                return { driveModel, isCreated }
            })
            .catch(handleError)

        if (!driveModel) {
            return handleError('Cannot setup system drive')
        }

        return driveModel.get({ plain: true })
    }

    async findAll({ limit = 10, offset = 0 }) {
        const { organizationId } = this

        const member = await this
            .getTenant()
            .catch(handleError)

        const { Drive } = member.tables
        const queryResults = await Drive
            .findAndCountAll({
                where: { organizationId },
                attributes: [
                    'id',
                    'title',
                    'description',
                    'readOnly',
                    'isSystem',
                    'updatedAt',
                    'createdAt',
                    'organizationId'
                ],
                limit, offset,
            })
            .catch(handleError)

        return {
            delta: {
                index: Math.floor(offset / limit),
                total: queryResults.count,
                limit, offset,
            },
            results: _.map(queryResults.rows, (driveModel) =>
                driveModel.get({ plain: true })
            )
        }
    }
}

module.exports = Drives
