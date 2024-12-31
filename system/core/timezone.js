const BasicRecord = require('./core/basic-record')

/**
 * Represents a user
 * @class Timezone
 */
class Timezone extends BasicRecord {

    static async getAll() {
        const results = await $ds.tables.Timezone
            .findAndCountAll({})
            .catch(handleError)

        return {
            delta: {
                index: 0,
                total: results.count,
                limit: results.count,
                offset: 0,
            },
            results: _.map(results.rows, (timezoneModel) =>
                timezoneModel.get({ plain: true })
            ),
        }
    }
}

module.exports = Timezone
