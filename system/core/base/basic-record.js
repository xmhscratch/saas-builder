class BasicRecord {

    static async getTenant(organizationId) {
        const organizationInfo = await new $.Organization({ organizationId })
            .getInfo()
            .catch(handleError)

        const { memberId } = organizationInfo

        return $ds
            .getMember(memberId)
            .catch(handleError)
    }
}

module.exports = BasicRecord
