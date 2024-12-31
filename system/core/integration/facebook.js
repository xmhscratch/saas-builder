const TenantRecord = require('../core/tenant-record')

class Facebook extends TenantRecord {

    static get API_VERSION() {
        return 'v6.0'
    }

    static get VALID_SCOPES() {
        return [
            // Instagram Platform
            'instagram_basic',
            'instagram_content_publish',
            'instagram_manage_comments',
            'instagram_manage_insights',
            // Live Video API
            'publish_video',
            // Messenger Platform
            'pages_messaging',
            // Pages and Business Assets
            'ads_management',
            'ads_read',
            'attribution_read',
            'business_management',
            'catalog_management',
            'leads_retrieval',
            'manage_pages',
            'pages_manage_cta',
            'pages_manage_instant_articles',
            'pages_show_list',
            'publish_pages',
            'read_insights',
            // User Data
            // Default Public Profile Fields
            'email',
            'groups_access_member_info',
            'publish_to_groups',
            'user_age_range',
            'user_birthday',
            'user_friends',
            'user_gender',
            'user_hometown',
            'user_likes',
            'user_link',
            'user_location',
            'user_photos',
            'user_posts',
            'user_videos',
            // WhatsApp Platform
            'whatsapp_business_management',
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

        const { IntegrationFacebook } = member.tables
        const integrationModel = await IntegrationFacebook
            .findOne({
                where: { organizationId },
            })
            .catch(handleError)

        if (!integrationModel) { return }

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

            const appId = config('facebook.appId')
            const appSecret = config('facebook.appSecret')
            const scopes = this._buildScopes(
                config('facebook.scopes'),
            )

            const { IntegrationFacebook } = member.tables
            this.model = await IntegrationFacebook
                .findOrCreate({
                    where: { organizationId },
                    defaults: {
                        ...Facebook.parseValues(infoValues),
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

        if (!this.model) { return false }

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
        } = config('facebook')

        const states = JSON.stringify({ organizationId })

        return `https://www.facebook.com/${Facebook.API_VERSION}/dialog/oauth?client_id=${appId}&redirect_uri=${redirectURI}&state=${states}&display=popup&response_type=code&granted_scopes=${scopes}`
    }

    async updateAccessToken({ code, hmac, timestamp }) {
        await this
            .loadModel()
            .catch(handleError)

        if (!this.model) { return false }

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
        } = config('facebook')

        return new Promise((resolve, reject) => {
            return request({
                method: 'POST',
                url: `https://graph.facebook.com/${Facebook.API_VERSION}/oauth/access_token`,
                qs: {
                    client_id: appId,
                    redirect_uri: redirectURI,
                    client_secret: appSecret,
                    code,
                },
                json: true,
            }, (error, resp, body) => {
                if (error) { return reject(error) }
                return resolve(body)
            })
        })
    }

    async grantScopes(scopes) {
        await this
            .loadModel()
            .catch(handleError)

        if (!this.model) { return false }

        scopes = this._buildScopes(scopes)
        const results = await this.model
            .update({ scopes })
            .catch(handleError)

        await this.model
            .reload()
            .catch(handleError)

        return results
    }

    _buildScopes(scopes) {
        scopes = _.isString(scopes)
            ? (_.split(scopes, /[, ]+/g) || [])
            : (scopes || [])

        return _.chain(scopes)
            .intersection(Facebook.VALID_SCOPES)
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

module.exports = Facebook
