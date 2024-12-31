/**
 * Represents a user
 * @class Folder
 */
class Nodes {

    constructor({ driveId }, { organizationId }) {
        this.driveId = driveId

        const { $qs } = global
        this.qs = $qs({ driveId }, { organizationId })

        return this
    }

    async getStats() {
        return this.qs
            .getStats()
            .catch(handleError)
    }
}

module.exports = Nodes
