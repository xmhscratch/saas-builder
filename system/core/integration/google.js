const { google } = require('googleapis')
const TenantRecord = require('../core/tenant-record')

const API_VERSION = ''
const VALID_SCOPES = [
    'https://www.googleapis.com/auth/youtube',
]

class Google extends TenantRecord {

    static get API_VERSION() {
        return API_VERSION
    }

    static get VALID_SCOPES() {
        return VALID_SCOPES
    }

    constructor({ organizationId }) {
        super(organizationId)

        const keys = config('google-oauth')
        const oauth2Client = new google.auth.OAuth2(
            _.get(keys, 'web.client_id'),
            _.get(keys, 'web.client_secret'),
            _.get(keys, 'web.redirect_uris'),
        )
        google.options({
            auth: oauth2Client,
        })

        this.oauth2Client = oauth2Client
        this.model = null

        return this
    }

    async loadModel() {
        if (!_.isNil(this.model)) { return this.model }

        const { organizationId } = this
        const member = await this
            .getTenant()
            .catch(handleError)

        const { IntegrationGoogle } = member.tables
        const integrationModel = await IntegrationGoogle
            .findOne({
                where: { organizationId },
            })
            .catch(handleError)

        if (!integrationModel) return

        this.model = integrationModel
        return integrationModel
    }

    async getInfo() {
        await this
            .loadModel()
            .catch(handleError)

        const { organizationId } = this
        if (!this.model) return { organizationId }
        return this.model.get({ plain: true })
    }

    async updateInfo(infoValues) {
        await this
            .loadModel()
            .catch(handleError)

        const { organizationId } = this
        if (!this.model) {
            const member = await this
                .getTenant()
                .catch(handleError)

            const clientId = config('google-oauth.web.client_id')
            const clientSecret = config('google-oauth.web.client_secret')

            const { IntegrationGoogle } = member.tables
            this.model = await IntegrationGoogle
                .findOrCreate({
                    where: { organizationId },
                    defaults: {
                        ...Google.parseValues(infoValues),
                        clientId,
                        clientSecret,
                        organizationId,
                    },
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

        return this.getInfo()
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
            // shopName,
            organizationId,
        } = integrationInfo

        const states = JSON.stringify({
            // shopName,
            organizationId,
        })
        const scopes = this._buildScopes(
            config('google.scopes'),
        )

        return this.oauth2Client
            .generateAuthUrl({
                access_type: 'online',
                scope: scopes,
                state: states,
            })
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
            organizationId,
            createdTime,
            expiresIn,
        } = integrationInfo

        // const keys = config('google-oauth')
        // const clientId = _.get(keys, 'web.client_id')
        // const clientSecret = _.get(keys, 'web.client_secret')

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

        await this.oauth2Client
            .getToken(code)
            .then(({ tokens }) => {
                this.oauth2Client.setCredentials(tokens)
                return true
            })
            .catch(handleError)

        const tokenInfo = await this.oauth2Client
            .getTokenInfo(this.oauth2Client.credentials.access_token)
            .catch(handleError)

        const { credentials } = this.oauth2Client

        const accessToken = credentials.access_token
        const tokenType = credentials.token_type
        const scopes = this._buildScopes(tokenInfo.scopes)

        return this
            .updateInfo({
                accessToken,
                tokenType,
                scopes,
                expiresIn: new Date(tokenInfo.expiry_date),
                createdTime: new Date(dateNow),
            })
            .catch(handleError)
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
            .intersection(VALID_SCOPES)
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

module.exports = Google
