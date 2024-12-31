const STATUS_ACTIVE = 1
const STATUS_SUSPEND = 2
const STATUS_UPGRADE = 3

module.exports = function (sequelize, DataTypes) {
    const Subscription = sequelize.define(
        'Subscription',
        {
            appName: {
                type: DataTypes.STRING(100),
                allowNull: false,
                primaryKey: true,
                field: 'app_name',
                references: {
                    model: 'app_installed',
                    key: 'app_name',
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE',
            },
            planName: {
                type: DataTypes.STRING(255),
                allowNull: false,
                field: 'plan_name'
            },
            monthlyPrice: {
                type: DataTypes.DECIMAL(12, 4),
                allowNull: false,
                field: 'monthly_price'
            },
            feeRate: {
                type: DataTypes.DECIMAL(12, 4),
                allowNull: false,
                field: 'fee_rate'
            },
            createdAt: {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
                field: 'created_at',
            },
            trialExpiredAt: {
                type: DataTypes.DATE,
                allowNull: true,
                field: 'trial_expired_at',
            },
            status: {
                type: DataTypes.INTEGER(1),
                allowNull: false,
                field: 'status',
                defaultValue: STATUS_ACTIVE,
            },
            organizationId: {
                type: DataTypes.CHAR(36),
                allowNull: false,
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
            tableName: 'subscriptions',
            timestamps: false,
            charset: 'ascii',
            collate: 'ascii_general_ci',
            indexes: [],
            associate: ({
                Subscription,
                OrganizationProfile,
                AppInstalled,
            }) => {
                Subscription.belongsTo(OrganizationProfile, {
                    as: 'organization',
                    foreignKey: 'organizationId',
                    constraints: true,
                })
                Subscription.belongsTo(AppInstalled, {
                    as: 'appInstalled',
                    foreignKey: 'appName',
                    constraints: true,
                })
            },
        },
    )

    Subscription.STATUS_ACTIVE = STATUS_ACTIVE
    Subscription.STATUS_SUSPEND = STATUS_SUSPEND
    Subscription.STATUS_UPGRADE = STATUS_UPGRADE

    Subscription.removeAttribute('id')
    return Subscription
}
