const { v4: uuidV4 } = require('uuid')
const { randomString } = require('../core/string')

const BasicRecord = require('../core/basic-record')

class OrganizationRepository extends BasicRecord {

    static async createNew(ownerId, {
        title,
        description,
    }) {
        const organizationId = uuidV4()
        const businessId = randomString(12)
        const memberId = 'f6u72m'

        const { Organization } = $ds.tables
        const { organizationModel, isCreated } = await Organization
            .findOrCreate({
                where: { ownerId, businessId },
                defaults: {
                    id: organizationId,
                    ownerId, businessId,
                    title, description,
                    memberId,
                },
            })
            .spread((organizationModel, isCreated) => {
                return { organizationModel, isCreated }
            })
            .catch(handleError)

        if (!organizationModel) {
            return handleError('cannot create organization')
        }

        if (isCreated) {
            const member = await OrganizationRepository
                .getTenant(organizationId)
                .catch(handleError)

            const { RewardAchievementFulfillment } = member.tables
            await RewardAchievementFulfillment
                .bulkCreate(
                    _
                    .chain([])
                    .concat(
                        require('../../schema/fixtures/reward/fulfillment'),
                    )
                    .map((o) => _.extend(o, { organizationId }))
                    .value(),
                    { updateOnDuplicate: ['id', 'organizationId'] },
                )
                .catch(handleError)
        }

        return organizationModel.get({ plain: true })
    }

    async findAllByOwner(ownerId, { limit = 10, offset = 0 }) {
        const { Organization } = $ds.tables
        const queryResults = await Organization
            .findAndCountAll({
                where: { ownerId },
                limit, offset,
            })
            .catch(handleError)

        return {
            delta: {
                index: Math.floor(offset / limit),
                total: queryResults.count,
                limit, offset,
            },
            results: _.map(queryResults.rows, (organizationModel) =>
                organizationModel.get({ plain: true })
            )
        }
    }

    async findAllByUser(userId, { limit = 10, offset = 0 }) {
        const {
            Organization,
            OrganizationUser,
        } = $ds.tables

        const queryResults = await OrganizationUser
            .findAndCountAll({
                where: { userId, isOwner: false },
                include: [
                    { model: Organization, as: 'organization' }
                ],
                limit, offset,
            })

        return {
            delta: {
                index: Math.floor(offset / limit),
                total: queryResults.count,
                limit, offset,
            },
            results: _.map(queryResults.rows, (organizationUserModel) => {
                return _.first(organizationUserModel.get('organization'))
            })
        }
    }
}

module.exports = OrganizationRepository
