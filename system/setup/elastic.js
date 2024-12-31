const { Client } = require('@elastic/elasticsearch')

module.exports = async (indexName) => {
    return new Client(config('elastic'))
}
