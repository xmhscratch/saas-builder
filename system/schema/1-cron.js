module.exports = function (sequelize, DataTypes) {
    const Cron = sequelize.define(
        'Cron',
        {
            cronName: {
                type: DataTypes.STRING(100),
                allowNull: false,
                primaryKey: true,
                field: 'cron_name',
            },
            cronSpec: {
                type: DataTypes.STRING(100),
                allowNull: false,
                field: 'cron_spec'
            },
            targetModel: {
                type: DataTypes.STRING(24),
                allowNull: true,
                field: 'target_model'
            },
            isEnabled: {
                type: DataTypes.INTEGER(1),
                allowNull: false,
                field: 'is_enabled'
            },
        },
        {
            tableName: 'crons',
            timestamps: false,
            charset: 'ascii',
            collate: 'ascii_general_ci',
            indexes: [],
            hooks: {
                afterSync() {
                    $._syncModelSchemas['Cron'] = async () => {
                        Cron.bulkCreate([
                            ...require('./fixtures/cron'),
                        ], { updateOnDuplicate: ['cronName'] })
                    }
                }
            },
        }
    )

    Cron.removeAttribute('id')
    return Cron
}
