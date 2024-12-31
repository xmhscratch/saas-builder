class UserSession {

    constructor(session) {
        this.session = session
        this.session.user = (this.session.user || null)

        return this
    }

    isLoggedIn() {
        return !_.isEmpty(this.session.user)
    }

    async getCurrentUser() {
        const userId = this.session.user

        return !_.isEmpty(userId)
            ? await (new $.User(userId))
                .getInfo()
                .catch(handleError)
            : null
    }

    getAuthSuccessRedirectUrl() {
        return this.session.homeURL
            || `http://${config('urls.base')}`
    }

    getSessionID() {
        return this.session.id
    }

    async login({ emailAddress, username }, inputPassword) {
        const userInfo = await UserSession
            .authenticate({ emailAddress, username }, inputPassword)
            .catch(handleError)

        this.session.user = userInfo.id

        await Promise
            .promisify(this.session.save.bind(this.session))
            .call(this.session)
            .catch(handleError)

        return userInfo
    }

    async register(
        { emailAddress, password, avatar, status },
        additionalAttributes,
    ) {
        const { userInfo, isCreated } = await $.User
            .findOrCreate({
                where: { emailAddress, password },
                defaults: {
                    ...{ emailAddress, password, avatar, status },
                    ...(additionalAttributes || {}),
                },
            })
            .catch(handleError)

        const inputPassword = _.get(userInfo, 'rawPassword')
        await this
            .login({ emailAddress, username }, inputPassword)
            .catch(handleError)

        this.session.isNewUser = isCreated
        return { isCreated, userInfo }
    }

    async logout() {
        return Promise
            .promisify(this.session.destroy.bind(this.session))
            .call(this.session)
            .catch(handleError)
    }

    async verifyAccount() {
        // return source.Users
        //     .findOne({
        //         where: {
        //             id: req.params.id,
        //             status: source.Users.STATUS_UNVERIFIED
        //         }
        //     })
        //     .then((model) => {
        //         if (!model) return res.redirect('/auth/')
        //         return model.update({
        //             status: source.Users.STATUS_OK
        //         }).then(function() {
        //             // helper('@mailer').send(
        //             //     'confirm', 'admin@tiachop.net',
        //             //     'TiaChop.net - Welcome', {
        //             //         to: model.get('email_address')
        //             //     }, {
        //             //         username: model.get('name')
        //             //     })

        //             return res.redirect('/auth/')
        //         })
        //     })
    }

    async resetPassword(emailAddress, newPassword) {
        const bcrypt = require('bcrypt')

        const { User } = $ds.tables
        const userModel = await User
            .findOne({
                where: { emailAddress }
            })
            .catch(handleError)

        if (!userModel) { return false }

        const salt = await bcrypt
            .genSalt(10)
            .catch(handleError)

        if (_.isEmpty(newPassword)) {
            return handleError('Password is empty')
        }

        const hashedPassword = await bcrypt
            .hash(newPassword, salt)
            .catch(handleError)

        await userModel
            .update({
                password: hashedPassword,
                rawPassword: newPassword,
            })
            .catch(handleError)

        await userModel
            .reload()
            .catch(handleError)

        return userModel.get({ plain: true })
    }

    static async authenticate(
        { emailAddress, username },
        inputPassword,
    ) {
        const { User } = $ds.tables
        const { Op } = System.Orm.Sequelize
        const bcrypt = require('bcrypt')

        const userModel = await User
            .findOne({
                where: {
                    [Op.or]: [
                        _.pickBy({ emailAddress: username || emailAddress }, _.identity),
                        _.pickBy({ username: username || emailAddress }, _.identity),
                    ],
                },
            })
            .catch(handleError)

        if (!userModel) { return false }
        const currentHashedPassword = userModel.get('password')

        const isAuthenticated = await Promise
            .promisify(bcrypt.compare.bind(bcrypt))
            .call(bcrypt, inputPassword, currentHashedPassword)
            .catch(handleError)

        if (!isAuthenticated) { return false }

        const userId = userModel.get('id')
        const user = new $.User(userId)

        return user
            .getInfo()
            .catch(handleError)
    }
}

module.exports = UserSession
