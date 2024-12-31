module.exports = {
    node: 'http://elk_elasticsearch:9200',
    maxRetries: 5,
    requestTimeout: 60000,
    sniffOnStart: true,
    auth: {
        username: 'elastic',
        password: 'changeme'
    }
}
