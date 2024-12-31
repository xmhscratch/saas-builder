const { MongoClient } = require('mongodb')

module.exports = () => {
    // const mongoHost = config('mongo.host', '127.0.0.1')
    // const mongoReplicaSet = config('mongo.replicaSet', 'replicaset')
    const mongoPort = config('mongo.port', '27017')
    const mongoUser = config('mongo.username', 'root')
    const mongoPass = config('mongo.password', '')

    const connectionURIString = $.util.format(
        `mongodb://%s/admin?readPreference=primary&connectTimeoutMS=10000&authSource=admin&authMechanism=SCRAM-SHA-1`,
        _
            .chain(config('mongo.servers', []))
            .map((mongoHost) => $.util.format(
                `%s:%s@%s:%s`, encodeURIComponent(mongoUser), encodeURIComponent(mongoPass), mongoHost, mongoPort,
            ))
            .join(',')
            .value(),
    )

    return MongoClient
        .connect(connectionURIString, {
            useUnifiedTopology: true,
            useNewUrlParser: true,
            readPreference: 'primary',
            // reconnectTries: 10,
            // reconnectInterval: 30,
        })
        .then((client) => {
            console.log(`mongodb connected ${JSON.stringify(config('mongo'))}`)
            return client
        })
        .catch(handleError)
}
