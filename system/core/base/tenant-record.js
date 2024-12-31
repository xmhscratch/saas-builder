const BasicRecord = require('./basic-record')

class TenantRecord extends BasicRecord {

    constructor(organizationId) {
        super()

        this.organizationId = String(organizationId)
        this._member = null

        return this
    }

    async getTenant() {
        const { organizationId } = this

        if (this._member) {
            return this._member
        }

        this._member = await TenantRecord
            .getTenant(organizationId)
            .catch(handleError)

        return this._member
    }
}

module.exports = TenantRecord
