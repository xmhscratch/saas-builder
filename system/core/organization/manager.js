// const nodemailer = require('nodemailer')
const { v5: uuidV5 } = require('uuid')
const Sequelize = require('sequelize')

const BasicRecord = require('../core/basic-record')

/**
 * Represents a user
 * @class App
 */
class OrganizationManager extends BasicRecord {

    constructor({ organizationId }) {
        super()
        this.organizationId = String(organizationId)
        return this
    }

    /**
     * Gets all users
     * @method Router#updateLayout
     */
    async getInfo() {
        const { organizationId } = this

        const { Organization } = $ds.tables
        const organizationModel = await Organization
            .findOne({
                where: { id: organizationId },
            })
            .catch(handleError)

        if (!organizationModel) {
            return handleError('Organization not found')
        }

        return organizationModel.get({ plain: true })
    }

    /**
     * Gets all users
     * @method Router#updateLayout
     */
    async getProfileInfo() {
        const { organizationId } = this

        const member = await OrganizationManager
            .getTenant(organizationId)
            .catch(handleError)

        const { OrganizationProfile } = member.tables
        const organizationProfileModel = await OrganizationProfile
            .findOne({ where: { organizationId } })
            .catch(handleError)

        if (!organizationProfileModel) {
            return handleError('Organization not found')
        }

        return organizationProfileModel.get({ plain: true })
    }

    /**
     * Gets all users
     * @method Router#updateLayout
     */
    async update(infoValues) {
        const { organizationId } = this

        const { Organization } = $ds.tables
        const organizationModel = await Organization
            .findOne({ where: { id: organizationId } })
            .catch(handleError)

        if (!organizationModel) {
            return handleError('Organization not found')
        }

        const results = await organizationModel
            .update(OrganizationManager.parseValues(infoValues))
            .catch(handleError)

        await organizationModel
            .reload()
            .catch(handleError)

        return results
    }

    /**
     * Gets all users
     * @method Router#updateLayout
     */
    async updateProfile(infoValues) {
        const { organizationId } = this

        const member = await OrganizationManager
            .getTenant(organizationId)
            .catch(handleError)

        const { OrganizationProfile } = member.tables
        const results = await OrganizationProfile
            .findOrCreate({
                where: { organizationId },
                defaults: {
                    ...OrganizationManager.parseProfileInfo(infoValues),
                    organizationId,
                }
            })
            .spread((organizationProfileModel, isCreated) => {
                return { organizationProfileModel, isCreated }
            })
            .catch(handleError)

        const { organizationProfileModel, isCreated } = results

        if (!organizationProfileModel) {
            return handleError('Organization profile not found')
        }

        await organizationProfileModel
            .update(OrganizationManager.parseProfileInfo(infoValues))
            .catch(handleError)

        return organizationProfileModel.get({ plain: true })
    }

    /**
     * Gets all users
     * @method Router#updateLayout
     */
    async delete() {
        const { organizationId } = this

        const member = await OrganizationManager
            .getTenant(organizationId)
            .catch(handleError)

        const {
            Organization,
            OrganizationUser,
        } = $ds.tables
        const { OrganizationProfile } = member.tables

        return Promise
            .all([
                OrganizationUser.destroy({
                    where: { organizationId },
                    // force: true,
                }),

                OrganizationProfile.destroy({
                    where: { organizationId },
                    // force: true,
                }),

                Organization.destroy({
                    where: { id: organizationId },
                    // force: true,
                }),
            ])
            .then(async (...args) => {
                await $.usage(organizationId)
                    .minus('core.organization_created', 1)
                    .catch(handleError)

                return args
            })
            .catch(handleError)
    }

    /**
     * Gets all users
     * @method Router#updateLayout
     */
    async isOwner(userId) {
        const { organizationId } = this

        const { Organization } = $ds.tables
        const recordCount = await Organization
            .count({
                where: { id: organizationId, ownerId: userId },
            })
            .catch(handleError)

        return _.gt(recordCount, 0) ? true : false
    }

    async sendInvitationEmail(emailAddress) {
        const { organizationId } = this

        const confirmUrl = await $.OrganizationInvitation
            .create(organizationId, emailAddress)
            .catch(handleError)

        // nodemailer.createTransport(config('mailtrap'))
        console.log(confirmUrl)

        return confirmUrl
    }

    async joinInvitedMember({
        emailAddress,
        password,
    }) {
        const { userInfo } = await $.User
            .create({
                emailAddress,
                password,
            })
            .catch(handleError)

        const userId = userInfo.id
        await this
            .addMember(userId)
            .catch(handleError)

        return true
    }

    async addMember(userId, isOwner = false) {
        const { organizationId } = this
        const { OrganizationUser } = $ds.tables

        await new $.User(userId)
            .getInfo()
            .catch(handleError)

        await OrganizationUser
            .upsert({ organizationId, userId, isOwner })
            .catch(handleError)

        await new $.Credential({ organizationId })
            .add(userId)
            .catch(handleError)

        return true
    }

    async removeMember(userId) {
        const { organizationId } = this

        const {
            User,
            Organization,
            OrganizationUser,
        } = $ds.tables

        const userModel = await Organization
            .findOne({
                where: { id: organizationId },
                include: [{
                    model: User,
                    as: 'users',
                    through: {
                        attributes: ['userId'],
                        where: { userId },
                    },
                }],
            })

        if (!userModel) {
            return handleError('user not belong to organization')
        }

        const results = await OrganizationUser
            .destroy({
                where: { organizationId, userId },
                force: true,
            })
            .catch(handleError)

        await new $.Credential({ organizationId })
            .remove(userId)
            .catch(handleError)

        return results
    }

    async getMemberUsers(ownerId, { limit = 20, offset = 0 }) {
        const { organizationId } = this

        const { Organization } = $ds.tables
        const organizationModel = await Organization
            .findOne({
                where: { id: organizationId, ownerId },
            })
            .catch(handleError)

        if (!organizationModel) {
            return handleError('organization not found')
        }

        const userCollection = await organizationModel
            .getUsers({
                attributes: ['id', 'username', 'emailAddress', 'avatar'],
                include: [
                    { model: $ds.tables.UserProfile, as: 'profile' }
                ]
            })
            .catch(handleError)

        return {
            delta: {
                index: Math.floor(offset / limit),
                total: _.size(userCollection),
                limit: limit,
                offset: offset
            },
            results: _.map(userCollection, (userModel) =>
                _.omit(userModel.get({ plain: true }), ['OrganizationUser'])
            ),
        }
    }

    /**
     * Gets all users
     * @method Router#updateLayout
     */
    static parseValues(values) {
        return values
    }

    /**
     * Gets all users
     * @method Router#updateLayout
     */
    static parseProfileInfo(infoValues) {
        return infoValues
    }
}

module.exports = OrganizationManager
