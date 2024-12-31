module.exports = async () => {
    if (!global.$amqp) {
        return handleError('AMQP is not setup')
    }

    const fontItems = await $.googleFont
        .findAll()
        .catch(handleError)

    const fontItemIds = _.map(fontItems, 'id')
    return Promise
        .mapSeries(fontItemIds, (fontId) => {
            const prefetchFontInfo = JSON.stringify({
                method: 'GET',
                url: `http://${config('urls.cluster.api')}/google-font/${fontId}`,
            })
            const prefetchFontBuffer = Buffer.from(prefetchFontInfo)

            return global.$amqp
                .assertQueue('webhook', { durable: true })
                .then((_qok) => {
                    global.$amqp.sendToQueue('webhook', prefetchFontBuffer)
                })
        })
        .catch(handleError)
}
