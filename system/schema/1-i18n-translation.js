// const { Translate } = require('@google-cloud/translate')

module.exports = function (sequelize, DataTypes) {
    // const translate = new Translate()

    const I18nTranslation = sequelize.define(
        'I18nTranslation',
        {
            baseId: {
                type: DataTypes.INTEGER(11),
                allowNull: false,
                primaryKey: true,
                field: 'base_id'
            },
            language: {
                type: DataTypes.STRING(60),
                allowNull: false,
                primaryKey: true,
                field: 'language'
            },
            i18nDefault: {
                type: DataTypes.TEXT() + ' CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci',
                allowNull: false,
                field: 'i18n_text'
            },
            i18nText: {
                type: DataTypes.TEXT() + ' CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci',
                allowNull: true,
                field: 'i18n_text'
            },
        },
        {
            tableName: 'i18n_translations',
            timestamps: false,
            charset: 'ascii',
            collate: 'ascii_general_ci',
            indexes: [],
            hooks: {
                afterSync: async () => {
                    // const supportLanguages = config('system.supportLanguages', ['en', 'zh-CN'])

                    // const entries = await Promise.reduce(
                    //     config('language'),
                    //     async (memo, i18nKey, baseId) => {
                    //         await Promise.each(supportLanguages, (language) => {
                    //             return translate
                    //                 .translate(i18nKey, language)
                    //                 .then(results => {
                    //                     const i18nDefault = _.first(results)
                    //                     memo.push({ baseId, language, i18nDefault })
                    //                 })
                    //                 .catch(error => {
                    //                     console.log(error)

                    //                     const i18nDefault = i18nKey
                    //                     memo.push({ baseId, language, i18nDefault })
                    //                 })
                    //         })
                    //         return memo
                    //     }, [])

                    // I18nTranslation.bulkCreate(entries, {
                    //     updateOnDuplicate: ['baseId', 'language']
                    // })
                }
            }
        },
    )

    return I18nTranslation
}
