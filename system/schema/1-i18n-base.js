module.exports = function (sequelize, DataTypes) {
    const I18nBase = sequelize.define(
        'I18nBase',
        {
            id: {
                type: DataTypes.INTEGER(11),
                allowNull: false,
                primaryKey: true,
                autoIncrement: true,
                field: 'id'
            },
            i18nKey: {
                type: DataTypes.STRING(1024),
                allowNull: false,
                unique: true,
                field: 'i18n_key',
            }
        },
        {
            tableName: 'i18n_bases',
            timestamps: false,
            charset: 'ascii',
            collate: 'ascii_general_ci',
            indexes: [],
            hooks: {
                afterSync: async () => {
                    I18nBase.bulkCreate(
                        _.map(
                            config('language'),
                            (i18nKey, id) => { return { id, i18nKey } }
                        ),
                        {
                            updateOnDuplicate: ['i18nKey']
                        }
                    )
                }
            }
        },
    )

    return I18nBase
}
