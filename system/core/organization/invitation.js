const { randomString, encrypt, decrypt } = require('../core/string')

class OrganizationInvitation {

    constructor(joinToken) {
        this.joinToken = joinToken
        return this
    }

    static async create(organizationId, emailAddress) {
        await global.$redis.select(3)

        const redisClient = global.$redis
        const joinToken = encrypt(`${emailAddress}:${organizationId}`)

        await new Promise((resolve, reject) => {
            return redisClient
                .multi([
                    ["SET", joinToken, JSON.stringify({
                        emailAddress,
                        password: randomString(16),
                        organizationId,
                    }), redisClient.print],
                    ["EXPIRE", joinToken, 86400],
                ])
                .exec((error, replies) => {
                    if (error) return reject(error)
                    return resolve(replies)
                })
        })

        const accountURL = config('urls.account')
        return `http://${accountURL}/organization/invites/${joinToken}`
    }

    async confirm() {
        const { joinToken } = this
        await global.$redis.select(3)
        const redisClient = global.$redis

        const results = await new Promise((resolve, reject) => {
            return redisClient.get(joinToken, (error, reply) => {
                if (error) return reject(error)
                return resolve(JSON.parse(reply))
            })
        })
        return results
    }

    async expire() {
        const { joinToken } = this
        await global.$redis.select(3)
        const redisClient = global.$redis

        const results = await new Promise((resolve, reject) => {
            return redisClient.del(joinToken, (error, reply) => {
                if (error) return reject(error)
                return resolve()
            })
        })
        return results
    }
}

module.exports = OrganizationInvitation
