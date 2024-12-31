module.exports = function (sequelize, DataTypes) {
    const AppService = sequelize.define(
        'AppService',
        {
            serviceName: {
                type: DataTypes.STRING(100),
                allowNull: false,
                primaryKey: true,
                field: 'service_name'
            },
            clusterDomainName: {
                type: DataTypes.STRING(512),
                allowNull: false,
                field: 'cluster_domain_name'
            },
            exposePort: {
                type: DataTypes.INTEGER(11),
                allowNull: false,
                field: 'expose_port'
            },
            hasCredentials: {
                type: DataTypes.BOOLEAN(),
                allowNull: false,
                field: 'has_credentials',
                defaultValue: false,
            },
        },
        {
            tableName: config('system.development', true) ? 'DEV_app_services' : 'app_services',
            timestamps: false,
            charset: 'ascii',
            collate: 'ascii_general_ci',
            indexes: [],
            hooks: {
                afterSync: async () => {
                    AppService.bulkCreate(
                        require('./fixtures/app-service')(),
                        { updateOnDuplicate: ['serviceName'] },
                    )
                },
            },
        },
    )

    AppService.removeAttribute('id')
    return AppService
}
