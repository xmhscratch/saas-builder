const redis = require('redis')

/*
1: session
*/

module.exports = (databaseNumber, isReturnClient = false) => {
    let client

    client = redis.createClient({
        ...config('redis'),
        legacyMode: true,
        db: databaseNumber,
        socket: {
            host: config('redis.host'),
            port: config('redis.port'),
            reconnectStrategy: (retries) => Math.min(retries * 50, 500),
        },
    })

    if (true == isReturnClient) {
        return client
    }

    return new Promise((resolve, reject) => {
        client.on('ready', () => {
            if (!databaseNumber) {
                console.log(`redis connected ${JSON.stringify(config('redis'))}`)
                return resolve(client)
            }
            client.select(databaseNumber, () => resolve(client))
            console.log(`redis db ${databaseNumber} connected ${JSON.stringify(config('redis'))}`)
        })
        client.on('error', reject)

        return client
    })
}
