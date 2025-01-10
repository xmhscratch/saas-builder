import exec from '../exec'

/**
 * Represents a user
 * @class User
 */
export default class User {

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
        const { isCreated, userInfo } = await exec('user.create', {
            emailAddress,
            password,
            avatar,
            status,
        }, attrs)

        return { isCreated, userInfo }
    }

    /**
     * Gets all users
     * @method Router#updateLayout
     */
    async getInfo() {
        const { userId } = this
        const userInfo = await exec('user.getInfo', userId)
        return userInfo
    }

    /**
     * Gets all users
     * @method Router#updateLayout
     */
    async getProfileInfo() {
        const { userId } = this
        const userProfileInfo = await exec('user.getProfileInfo', userId)
        return userProfileInfo
    }

    /**
     * Gets all users
     * @method Router#updateLayout
     */
    async updateProfile(infoValues) {
        const { userId } = this
        const userProfileInfo = await exec('user.updateProfile', userId, infoValues)
        return userProfileInfo
    }

    /**
     * Gets all users
     * @method Router#updateLayout
     */
    async updateAvatar(imageBuffer) {
        const { userId } = this
        const userInfo = await exec('user.updateAvatar', userId, imageBuffer)
        // $events({ userId }).dispatch('user/updated', userInfo)
        return userInfo
    }

    /**
     * Gets all users
     * @method Router#updateLayout
     */
    async updatePassword(oldPassword, newPassword) {
        const { userId } = this
        const userInfo = await exec('user.updatePassword', userId, oldPassword, newPassword)
        return userInfo
    }

    /**
     * Gets all users
     * @method Router#updateLayout
     */
    async delete() {
        const { userId } = this
        const results = await exec('user.delete', userId)
        // $events({ userId }).dispatch('user/deleted', userInfo)
        return results
    }
}
