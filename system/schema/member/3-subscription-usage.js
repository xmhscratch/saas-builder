module.exports = function (sequelize, DataTypes) {
    const SubscriptionUsage = sequelize.define(
        'SubscriptionUsage',
        {
            quotaName: {
                type: DataTypes.STRING(512),
                allowNull: false,
                primaryKey: true,
                field: 'quota_name'
            },
            quotaCap: {
                type: DataTypes.DECIMAL(12, 4).UNSIGNED,
                allowNull: true,
                field: 'quota_cap'
            },
            quotaValue: {
                type: DataTypes.DECIMAL(12, 4).UNSIGNED,
                allowNull: false,
                field: 'quota_value',
                defaultValue: 0.0000,
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
            tableName: 'subscription_usages',
            timestamps: false,
            charset: 'ascii',
            collate: 'ascii_general_ci',
            indexes: [],
            associate: ({
                SubscriptionUsage,
                OrganizationProfile,
            }) => {
                SubscriptionUsage.belongsTo(OrganizationProfile, {
                    as: 'organization',
                    foreignKey: 'organizationId',
                    constraints: true,
                })
            },
        },
    )

    SubscriptionUsage.removeAttribute('id')
    return SubscriptionUsage
}
