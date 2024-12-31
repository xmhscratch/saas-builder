module.exports = async function (
    organizationId,
    { bcc, cc, to, subject, replyto, sender },
    contentBody,
) {
    const mailerClusterHost = config('urls.cluster.mailer')
    const queryString = $.node.querystring
        .stringify({ bcc, cc, to, subject, replyto, sender })

    const sendmailInfo = JSON.stringify({
        url: `http://${mailerClusterHost}/?${queryString}`,
        data: contentBody,
        headers: { "x-organization-id": organizationId },
    })
    const sendmailBuffer = Buffer.from(sendmailInfo)

    return global.$amqp
        .assertQueue('webhook', { durable: true })
        .then((_qok) => {
            global.$amqp.sendToQueue('webhook', sendmailBuffer)
        })
}
