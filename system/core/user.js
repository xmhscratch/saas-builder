const { v4: uuidV4 } = require('uuid')

const { randomString } = require('./core/string')

/**
 * Represents a user
 * @class User
 */
class User {

    constructor(userId) {
        this.userId = String(userId)

        // const MEMBER_IDS = [
        //     'qazk2p', 'ayf3v5', 'bp3enr', 'zpw6u7', 'f6u72m',
        //     'wy5u3k', 'kbf5jy', 'y3bmk7', 'tb9yrq', 'vxar2h'
        // ]
        // Promise.mapSeries(MEMBER_IDS, (memberId) => {
        //     return $ds.createMember(memberId)
        // }).then(() => {
        //     console.log("done")
        // }).catch((error) => {
        //     console.log(error)
        // })
        // const memberId = MEMBER_IDS[_.random(0, 9)]

        return this
    }

    static async create({
        emailAddress,
        password,
        avatar,
        status,
    }, attrs = {}) {
        const bcrypt = require('bcrypt')

        const salt = await bcrypt
            .genSalt(10)
            .catch(handleError)

        if (_.isEmpty(password)) {
            password = randomString(8)
        }

        const hashedPassword = await bcrypt
            .hash(password, salt)
            .catch(handleError)

        const { isCreated, userModel } = await $ds.tables.User
            .findOrCreate({
                where: { emailAddress },
                defaults: {
                    id: uuidV4(),
                    password: hashedPassword,
                    rawPassword: password,
                    username: emailAddress,
                    emailAddress: emailAddress,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    avatar: avatar,
                    status: status || $.User.STATUS_INACTIVE,
                }
            })
            .spread((userModel, isCreated) => {
                return { userModel, isCreated }
            })
            .catch(handleError)

        const userId = userModel.get('id')
        await $ds.tables.UserProfile
            .upsert({
                userId,
                facebookId: attrs.facebookId,
                timeZone: attrs.timeZone,
            })
            .catch(handleError)

        const userInfo = userModel.get({ plain: true })
        return { isCreated, userInfo }
    }

    /**
     * Gets all users
     * @method Router#updateLayout
     */
    async getInfo() {
        const { userId } = this

        const userModel = await $ds.tables.User
            .findOne({
                where: { id: userId },
                include: [
                    {
                        model: $ds.tables.UserProfile,
                        as: 'profile',
                    }
                ],
                attributes: [
                    'id',
                    'username',
                    'emailAddress',
                    'avatar',
                    'createdAt',
                    'updatedAt',
                    'status',
                ]
            })
            .catch(handleError)

        if (!userModel) {
            return handleError('user not found')
        }

        return userModel.get({ plain: true })
    }

    /**
     * Gets all users
     * @method Router#updateLayout
     */
    async getProfileInfo() {
        const { userId } = this

        const userProfileModel = await $ds.tables.UserProfile
            .findOne({ where: { userId } })
            .catch(handleError)

        if (!userProfileModel) {
            return handleError('user not found')
        }

        return userProfileModel.get({ plain: true })
    }

    /**
     * Gets all users
     * @method Router#updateLayout
     */
    async updateProfile(infoValues) {
        const { userId } = this

        const userProfileModel = await $ds.tables.UserProfile
            .findOne({ where: { userId } })
            .catch(handleError)

        if (!userProfileModel) {
            return handleError('user profile not found')
        }

        await userProfileModel
            .update(User.parseValues(infoValues))
            .catch(handleError)

        await userProfileModel
            .reload()
            .catch(handleError)

        if (!userProfileModel) {
            return handleError('cannot update user profile')
        }

        return userProfileModel.get({ plain: true })
    }

    /**
     * Gets all users
     * @method Router#updateLayout
     */
    async updateAvatar(imageBuffer) {
        const { userId } = this

        const userModel = await $ds.tables.User
            .findOne({ where: { id: userId } })
            .catch(handleError)

        if (!userModel) {
            return handleError('user not found')
        }

        const avatar = Buffer.isBuffer(imageBuffer)
            ? await $.Thumbnail
                .create(imageBuffer, {
                    width: 128,
                    height: 128,
                })
                .catch(handleError)
            : new Buffer([0x00])

        await userModel
            .update(
                { avatar: !_.isEmpty(avatar) ? avatar : null },
                { where: { id: userId },
            })
            .catch(handleError)

        if (!userModel) {
            return handleError('cannot update user\'s avatar')
        }

        let userInfo = userModel.get({ plain: true })

        // $events({ userId }).dispatch('user/updated', userInfo)
        return userInfo
    }

    /**
     * Gets all users
     * @method Router#updateLayout
     */
    async updatePassword(oldPassword, newPassword) {
        const { userId } = this

        const bcrypt = require('bcrypt')

        const userModel = await $ds.tables.User
            .findOne({
                where: { id: userId }
            })
            .catch(handleError)

        if (!userModel) {
            return handleError('cannot update user\'s password')
        }

        let userInfo = userModel.get({ plain: true })
        const currentHashedPassword = userModel.get('password')

        const results = await bcrypt
            .compare(oldPassword, currentHashedPassword)
            .catch(handleError)

        if (_.isEqual(results, false)) {
            return userInfo
        }

        const hashedPassword = bcrypt.hashSync(
            newPassword, config('server.salt')
        )

        await userModel
            .update({
                password: hashedPassword,
                rawPassword: newPassword,
            })
            .catch(handleError)

        return userModel.get({ plain: true })
    }

    /**
     * Gets all users
     * @method Router#updateLayout
     */
    async delete() {
        const { userId } = this

        const userModel = await $ds.tables.User
            .findOne({ where: { id: userId } })
            .catch(handleError)

        if (!userModel) {
            return handleError('cannot update user\'s password')
        }
    
        const userInfo = userModel.get({ plain: true })

        // $events({ userId }).dispatch('user/deleted', userInfo)
        return userModel
            .destroy({ force: true })
            .catch(handleError)
    }

    /**
     * Gets all users
     * @method Router#updateLayout
     */
    static parseValues(infoValues) {
        return infoValues
    }
}

module.exports = User

module.exports.STATUS_INACTIVE = 1
module.exports.STATUS_ACTIVE_TRIAL = 2
module.exports.STATUS_ACTIVE_PAID = 3
module.exports.STATUS_EXPIRED = 4
module.exports.STATUS_PENDING_REMOVAL = 5
