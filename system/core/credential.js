const TenantRecord = require('./core/tenant-record')

const { uuidV4 } = require('./core/string')

class Credential extends TenantRecord {

    constructor({ organizationId }) {
        super(organizationId)

        this.organizationId = String(organizationId)
        if (!organizationId) {
            return handleError(`Organization ID cannot be empty!`)
        }

        return this
    }

    async add(accountId) {
        const { organizationId } = this

        const tenant = await Credential
            .getTenant(organizationId)
            .catch(handleError)

        const credentialId = uuidV4()
        const { credentialModel, isCreated } = await tenant.tables.Credential
            .findOrCreate({
                where: { accountId, organizationId },
                defaults: $.Credential.parseValues({
                    id: credentialId,
                    accountId, organizationId,
                    isOwner: true,
                })
            })
            .spread((credentialModel, isCreated) => {
                return { credentialModel, isCreated }
            })
            .catch(handleError)

        if (!credentialModel) {
            return handleError('Cannot add credential to organization')
        }

        return credentialModel.get({ plain: true })
    }

    async remove(accountId) {
        const { organizationId } = this
        const tenant = await this
            .getTenant()
            .catch(handleError)

        const credentialModel = await tenant.tables.Credential
            findOne({
                where: { accountId, organizationId },
            })
            .catch(handleError)

        if (!credentialModel) {
            return handleError('Credential not found')
        }

        // const credentialId = credentialModel.get('id')

        // // remove drive credentials
        // await tenant.tables.DriveCredential
        //     .destroy({
        //         where: { credentialId, organizationId },
        //         force: true,
        //     })
        //     .catch(handleError)

        return credentialModel.destroy({ force: true })
    }

    static parseValues(infoValues) {
        return infoValues
    }
}

module.exports = Credential
