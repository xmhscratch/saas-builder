class Events {

    constructor(amqpChannel, { userId, organizationId, appName }) {
        this.channel = amqpChannel

        this.userId = String(userId)
        this.organizationId = String(organizationId)
        this.appName = String(appName)

        return this
    }

    async dispatch(eventName, postData = {}, headers = {}) {
        const { userId, organizationId, appName } = this

        const eventInfos = await new $.EventHooks(appName, { userId, organizationId })
            .findEvents(eventName)
            .catch(handleError)

        const eventItems = eventInfos.results

        return Promise
            .map(eventItems, (hookItem) => {
                const dataBuffer = Buffer.from(
                    JSON.stringify({
                        url: String(hookItem.callbackUrl),
                        data: postData,
                        headers: headers,
                    })
                )
                return this.channel.sendToQueue('webhook', dataBuffer)
            })
            .catch(handleError)
    }
}

module.exports = Events
