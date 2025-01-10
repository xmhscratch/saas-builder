import { v4 as uuidV4 } from 'uuid'

import { randomString } from '../core/string'

export const STATUS_INACTIVE = 1
export const STATUS_ACTIVE_TRIAL = 2
export const STATUS_ACTIVE_PAID = 3
export const STATUS_EXPIRED = 4
export const STATUS_PENDING_REMOVAL = 5

export default {
    async create({
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
    },

    async getInfo(userId) {
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
    },

    /**
     * Gets all users
     * @method Router#updateLayout
     */
    async getProfileInfo(userId) {
        const userProfileModel = await $ds.tables.UserProfile
            .findOne({ where: { userId } })
            .catch(handleError)

        if (!userProfileModel) {
            return handleError('user not found')
        }

        return userProfileModel.get({ plain: true })
    },

    /**
     * Gets all users
     * @method Router#updateLayout
     */
    async updateProfile(userId, infoValues) {
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
    },

    /**
     * Gets all users
     * @method Router#updateLayout
     */
    async updateAvatar(userId, imageBuffer) {
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

        return userInfo
    },

    /**
     * Gets all users
     * @method Router#updateLayout
     */
    async updatePassword(userId, oldPassword, newPassword) {
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
            })
            .catch(handleError)

        return userModel.get({ plain: true })
    },

    /**
     * Gets all users
     * @method Router#updateLayout
     */
    async delete(userId) {
        const userModel = await $ds.tables.User
            .findOne({ where: { id: userId } })
            .catch(handleError)

        if (!userModel) {
            return handleError('cannot update user\'s password')
        }

        await userModel
            .destroy({ force: true })
            .catch(handleError)

        return true
    },

    // /**
    //  * Gets all users
    //  * @method Router#updateLayout
    //  */
    // parseValues(infoValues) {
    //     return infoValues
    // }
}
