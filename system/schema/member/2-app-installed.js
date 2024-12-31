module.exports = function (sequelize, DataTypes) {
    const AppInstalled = sequelize.define(
        'AppInstalled',
        {
            appName: {
                type: DataTypes.STRING(100),
                allowNull: false,
                primaryKey: true,
                field: 'app_name',
            },
            version: {
                type: DataTypes.STRING(100),
                allowNull: false,
                field: 'version'
            },
            organizationId: {
                type: DataTypes.CHAR(36),
                allowNull: false,
                primaryKey: true,
                field: '_organization_id',
                references: {
                    model: 'organization_profiles',
                    key: 'organization_id',
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE',
            },
        },
        {
            tableName: 'app_installed',
            timestamps: false,
            charset: 'ascii',
            collate: 'ascii_general_ci',
            indexes: [],
            associate: ({
                AppInstalled,
                Subscription,
                OrganizationProfile,
            }) => {
                AppInstalled.belongsTo(OrganizationProfile, {
                    as: 'organization',
                    foreignKey: 'organizationId',
                    constraints: true,
                })
                AppInstalled.hasOne(Subscription, {
                    as: 'subscription',
                    foreignKey: 'appName',
                    constraints: false,
                })
            },
        },
    )

    AppInstalled.removeAttribute('id')
    return AppInstalled
}
