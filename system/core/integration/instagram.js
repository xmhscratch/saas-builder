const TenantRecord = require('../core/tenant-record')

class Instagram extends TenantRecord {

    static get API_VERSION() {
        return ''
    }

    static get VALID_SCOPES() {
        return [
            'user_profile',
            'user_media',
        ]
    }

    constructor({ organizationId }) {
        super(organizationId)

        this.model = null
        return this
    }

    async loadModel() {
        if (!_.isNil(this.model)) {
            return this.model
        }

        const { organizationId } = this
        const member = await this
            .getTenant()
            .catch(handleError)

        const { IntegrationInstagram } = member.tables
        const integrationModel = await IntegrationInstagram
            .findOne({
                where: { organizationId },
            })
            .catch(handleError)

        if (!integrationModel) return

        this.model = integrationModel
        return integrationModel
    }

    async getInfo() {
        const { organizationId } = this

        await this.loadModel()

        if (!this.model) return { organizationId }
        return this.model.get({ plain: true })
    }

    async updateInfo(infoValues) {
        const { organizationId } = this

        await this.loadModel()

        if (!this.model) {
            const member = await this
                .getTenant()
                .catch(handleError)

            const appId = config('instagram.appId')
            const appSecret = config('instagram.appSecret')
            const scopes = this._buildScopes(
                config('instagram.scopes'),
            )

            const { IntegrationInstagram } = member.tables
            this.model = await IntegrationInstagram
                .findOrCreate({
                    where: { organizationId },
                    defaults: {
                        ...Instagram.parseValues(infoValues),
                        appId,
                        scopes,
                        organizationId,
                    }
                })
                .spread(function (integrationModel, isCreated) {
                    return integrationModel
                })
        }
        else {
            this.model = await this.model
                .update(infoValues)
                .catch(handleError)

            await this.model
                .reload()
                .catch(handleError)
        }

        return this.model.get({ plain: true })
    }

    async buildAuthorizeURL() {
        await this
            .loadModel()
            .catch(handleError)

        if (!this.model) return false

        const integrationInfo = await this
            .getInfo()
            .catch(handleError)

        const {
            scopes,
            organizationId,
        } = integrationInfo

        const {
            appId,
            // appSecret,
            redirectURI,
            // nonce,
        } = config('instagram')

        const states = JSON.stringify({
            organizationId,
        })

        return `https://www.instagram.com/oauth/authorize?client_id=${appId}&redirect_uri=${redirectURI}&state=${states}&display=popup&response_type=code&scope=${scopes}`
    }

    async updateAccessToken({ code, hmac, timestamp }) {
        await this
            .loadModel()
            .catch(handleError)

        if (!this.model) return false

        const integrationInfo = await this
            .getInfo()
            .catch(handleError)

        const {
            // organizationId,
            createdTime,
            expiresIn,
        } = integrationInfo

        let hasToken = true

        const dateNow = !_.isEmpty(timestamp)
            ? (new Date(parseInt(timestamp) * 1000)).getTime()
            : (new Date()).getTime()

        if (!_.isEmpty(expiresIn) && (dateNow > (createdTime + expiresIn))) {
            hasToken = false
        }

        if (_.isEmpty(integrationInfo.accessToken)) {
            hasToken = false
        }

        if (!hasToken && _.isEmpty(code)) {
            return handleError('Integration process is not completed')
        }

        if (hasToken) {
            return this.getInfo()
        }

        const tokenInfo = await this
            .exchangeAccessToken(code)
            .catch(handleError)

        const accessToken = tokenInfo.access_token
        const tokenType = tokenInfo.token_type

        return this
            .updateInfo({
                accessToken,
                tokenType,
                expiresIn: new Date(dateNow + (tokenInfo.expires_in * 1000)),
                createdTime: new Date(dateNow),
            })
            .catch(handleError)
    }

    async exchangeAccessToken(code) {
        const {
            appId,
            appSecret,
            redirectURI,
            // nonce,
        } = config('instagram')

        return new Promise((resolve, reject) => {
            return request({
                method: 'POST',
                url: `https://api.instagram.com/oauth/access_token`,
                formData: {
                    client_id: appId,
                    client_secret: appSecret,
                    code,
                    grant_type: 'authorization_code',
                    redirect_uri: redirectURI,
                },
                json: true,
            }, (error, resp, body) => {
                if (error) { return reject(error) }

                return request({
                    method: 'GET',
                    url: `https://graph.instagram.com/access_token`,
                    qs: {
                        // client_id: appId,
                        client_secret: appSecret,
                        grant_type: 'ig_exchange_token',
                        access_token: body.access_token,
                    },
                    json: true,
                }, (error, resp, body) => {
                    if (error) { return reject(error) }
                    return resolve(body)
                })
            })
        })
    }

    async grantScopes(scopes) {
        await this
            .loadModel()
            .catch(handleError)

        if (!this.model) return false

        scopes = this._buildScopes(scopes)
        return this.model
            .update({ scopes })
            .catch(handleError)
    }

    _buildScopes(scopes) {
        scopes = _.isString(scopes)
            ? (_.split(scopes, /[, ]+/g) || [])
            : (scopes || [])

        return _.chain(scopes)
            .intersection(Instagram.VALID_SCOPES)
            .join(',')
            .value()
    }

    /**
     * Gets all users
     * @method Router#updateLayout
     */
    static parseValues(values, { includes, excludes } = {}) {
        let results = {}

        _.forEach(values, (value, key) => {
            switch (key) {
                case 'organizationId':
                case 'appId':
                case 'appSecret':
                case 'clientId':
                case 'clientSecret':
                case 'state':
                case 'updatedAt':
                case 'expiresIn':
                case 'accessToken':
                case 'tokenType':
                case 'code':
                case 'scopes':
                    _.extend(results, {
                        [`${key}`]: value ? String(value) : null,
                    })
                    break
                default: break
            }
        })

        if (includes) {
            results = _.pick(results, includes)
        }

        if (excludes) {
            results = _.omit(results, excludes)
        }

        return results
    }
}

module.exports = Instagram
