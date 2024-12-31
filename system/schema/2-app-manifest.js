module.exports = function (sequelize, DataTypes) {
    return sequelize.define(
        'AppManifest',
        {
            appName: {
                type: DataTypes.STRING(100),
                allowNull: false,
                primaryKey: true,
                field: 'app_name',
                references: {
                    model: config('system.development', true) ? 'DEV_apps' : 'apps',
                    key: 'app_name',
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE',
            },
            configKey: {
                type: DataTypes.STRING(255),
                allowNull: false,
                primaryKey: true,
                field: 'config_key'
            },
            configValue: {
                type: DataTypes.TEXT() + ' CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci',
                allowNull: false,
                field: 'config_value'
            },
        },
        {
            tableName: 'app_manifests',
            timestamps: false,
            charset: 'ascii',
            collate: 'ascii_general_ci',
            indexes: [
                {
                    name: "app_name",
                    using: "BTREE",
                    fields: [
                        { name: "app_name" },
                    ]
                },
            ],
            associate: ({
                AppManifest,
                App,
            }) => {
                AppManifest.belongsTo(App, {
                    as: 'app',
                    foreignKey: 'appName',
                    constraints: true,
                })
            },
        },
    )
}
