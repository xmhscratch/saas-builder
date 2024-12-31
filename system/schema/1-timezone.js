module.exports = function (sequelize, DataTypes) {
    const Timezone = sequelize.define(
        'Timezone',
        {
            id: {
                type: DataTypes.INTEGER(11),
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                field: 'id',
            },
            gmtAdjustment: {
                type: DataTypes.STRING(255),
                allowNull: false,
                field: 'gmt_adjustment',
                defaultValue: "GMT+00:00",
            },
            useDaylightTime: {
                type: DataTypes.BOOLEAN(),
                allowNull: false,
                field: 'use_daylight_time',
                defaultValue: false,
            },
            value: {
                type: DataTypes.FLOAT(10, 2),
                allowNull: false,
                field: 'value',
                defaultValue: 0,
            },
            title: {
                type: DataTypes.STRING(255) + ' CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci',
                allowNull: false,
                field: 'title',
            },
        },
        {
            tableName: 'timezones',
            underscored: true,
            timestamps: false,
            charset: 'ascii',
            collate: 'ascii_general_ci',
            indexes: [],
            hooks: {
                afterSync() {
                    $._syncModelSchemas['Timezone'] = async () => {
                        Timezone.bulkCreate(require('./fixtures/timezone'), {
                            updateOnDuplicate: ['id']
                        })
                    }
                }
            }
        },
    )

    return Timezone
}
