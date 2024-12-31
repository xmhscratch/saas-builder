const sequelize = require('sequelize')

const TenantRecord = require('../../core/tenant-record')

const QUERY_COUNT_DRIVE_CREDENTIAL_INTERSECTION = require('../../core/queries/storage/count-drive-credential-intersection')
const QUERY_ALL_DRIVE_CREDENTIAL_INTERSECTION = require('../../core/queries/storage/all-drive-credential-intersection')

class Drive extends TenantRecord {

    constructor({ driveId }, { organizationId }) {
        super(organizationId)

        this.driveId = String(driveId)
        this.organizationId = String(organizationId)

        if (!driveId) {
            return handleError(`Drive ID cannot be empty!`)
        }

        if (!organizationId) {
            return handleError(`Organization ID cannot be empty!`)
        }

        return this
    }

    async getInfo() {
        const { driveId, organizationId } = this

        const member = await this
            .getTenant()
            .catch(handleError)

        const driveModel = await member.tables.Drive
            .findOne({
                where: { id: driveId, organizationId }
            })
            .catch(handleError)

        if (!driveModel) {
            return handleError(`Drive with ID '${driveId}' not found`)
        }

        return driveModel.get({ plain: true })
    }

    async updateInfo(infoValues) {
        const { driveId, organizationId } = this

        const member = await this
            .getTenant()
            .catch(handleError)

        const driveModel = await member.tables.Drive
            .findOne({
                where: { id: driveId, organizationId }
            })
            .catch(handleError)

        if (!driveModel) {
            return handleError(`Drive with ID '${driveId}' not found`)
        }

        await driveModel
            .update(Drive.parseValues(infoValues))
            .catch(handleError)

        await driveModel
            .reload()
            .catch(handleError)

        return driveModel.get({ plain: true })
    }

    async delete() {
        const { driveId, organizationId } = this

        const member = await this
            .getTenant()
            .catch(handleError)

        const driveModel = await member.tables.Drive
            .findOne({
                where: { id: driveId, organizationId }
            })
            .catch(handleError)

        if (!driveModel) {
            return handleError(`Drive with ID '${driveId}' not found`)
        }

        // remove drive's credentials
        await member.tables.DriveCredential
            .destroy({
                where: { driveId },
                force: true,
            })
            .catch(handleError)

        return driveModel.destroy({ force: true })
    }

    async findAllCredentials({ limit = 10, offset = 0 }) {
        const { driveId, organizationId } = this

        const member = await this
            .getTenant()
            .catch(handleError)

        const driveModel = await member.tables.Drive
            .findOne({ where: { id: driveId, organizationId } })
            .catch(handleError)

        if (!driveModel) {
            return handleError(`Drive with ID '${driveId}' not found`)
        }

        const credentialCollection = await driveModel
            .getCredentials({
                attributes: ['id', 'accountId'],
                limit, offset,
            })
            .catch(handleError)

        return {
            delta: {
                index: Math.floor(offset / limit),
                total: _.size(credentialCollection),
                limit, offset,
            },
            results: _.map(credentialCollection, (credentialModel) =>
                _.omit(credentialModel.get({ plain: true }), ['DriveCredential'])
            ),
        }
    }

    async findAllAvailableCredentials({ limit = 10, offset = 0 }) {
        const { driveId, organizationId } = this

        const member = await this
            .getTenant()
            .catch(handleError)

        const queryCount = await member.getDb().getConnection()
            .query(QUERY_COUNT_DRIVE_CREDENTIAL_INTERSECTION, {
                type: sequelize.QueryTypes.SELECT,
                replacements: { driveId, organizationId },
            })
            .catch(handleError)

        const count = _.toNumber(
            _.get(queryCount, '0.count', 0)
        )

        const queryResults = await member.getDb().getConnection()
            .query(QUERY_ALL_DRIVE_CREDENTIAL_INTERSECTION, {
                type: sequelize.QueryTypes.SELECT,
                replacements: { driveId, organizationId, limit, offset },
                model: member.tables.Credential,
            })
            .catch(handleError)

        return {
            delta: {
                index: Math.floor(offset / limit),
                total: count,
                limit, offset,
            },
            results: _.map(queryResults, (credentialModel) =>
                credentialModel.get({ plain: true })
            )
        }
    }

    async addCredential(credentialId) {
        const { driveId, organizationId } = this

        const member = await this
            .getTenant()
            .catch(handleError)

        const credentialModel = await member.tables.Credential
            .findOne({
                where: { id: credentialId, organizationId }
            })
            .catch(handleError)

        if (!credentialModel) {
            return handleError(`Credential with ID '${credentialId}' not found`)
        }

        // add drive credentials
        await member.tables.DriveCredential
            .upsert({ credentialId, driveId, organizationId })
            .catch(handleError)

        return true
    }

    async removeCredential(credentialId) {
        const { driveId, organizationId } = this
        const member = await this
            .getTenant()
            .catch(handleError)

        // remove drive credentials
        await member.tables.DriveCredential
            .destroy({
                where: { credentialId, driveId, organizationId },
                force: true,
            })
            .catch(handleError)

        return true
    }

    static parseValues(infoValues) {
        return infoValues
    }
}

module.exports = Drive
