const amqp = require('amqp-connection-manager')

module.exports = async () => {
    const connection = amqp
        .connect(config('amqp'), {
            heartbeatIntervalInSeconds: 5,
            connectionOptions: {
                clientProperties: {
                    product: `${process.env.APP_NAME}`,
                    platform: undefined,
                },
            }
        })

    process.once('SIGINT', connection.close.bind(connection))

    const channel = connection.createChannel()

    console.log(`amqp connected ${JSON.stringify(config('amqp'))}`)

    channel.on('close', () => process.exit())
    channel.on('error', () => process.exit())

    return channel
}
