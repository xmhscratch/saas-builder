module.exports = function (sequelize, DataTypes) {
    const App = sequelize.define('App',
        {
            appName: {
                type: DataTypes.STRING(100),
                allowNull: false,
                primaryKey: true,
                field: 'app_name',
            },
            iconSvg: {
                type: DataTypes.TEXT(),
                allowNull: true,
                field: 'icon_svg'
            },
            title: {
                type: DataTypes.STRING(255) + ' CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci',
                allowNull: false,
                field: 'title'
            },
            description: {
                type: DataTypes.TEXT() + ' CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci',
                allowNull: true,
                field: 'description'
            },
            shortDescription: {
                type: DataTypes.TEXT() + ' CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci',
                allowNull: true,
                field: 'short_description'
            },
            manifest: {
                type: DataTypes.TEXT() + ' CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci',
                allowNull: false,
                field: 'manifest'
            },
            isReleased: {
                type: DataTypes.BOOLEAN(),
                allowNull: false,
                field: 'is_released',
                defaultValue: false,
            },
            isConfigured: {
                type: DataTypes.BOOLEAN(),
                allowNull: false,
                field: 'is_configured',
                defaultValue: false,
            },
        },
        {
            tableName: config('system.development', true) ? 'DEV_apps' : 'apps',
            timestamps: false,
            charset: 'ascii',
            collate: 'ascii_general_ci',
            indexes: [],
            hooks: {
                afterSync() {
                    $._syncModelSchemas['App'] = async () => {
                        App.bulkCreate(
                            config('system.development', true)
                                ? require('./fixtures/app/development')
                                : require('./fixtures/app/production')
                            , { updateOnDuplicate: ['appName'] }
                        )
                    }
                },
            },
        }
    )

    App.removeAttribute('id')
    return App
}
