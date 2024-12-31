module.exports = function (sequelize, DataTypes) {
    return sequelize.define(
        'Wallet',
        {
            id: {
                type: DataTypes.STRING(255),
                allowNull: false,
                primaryKey: true,
                field: 'id'
            },
            description: {
                type: DataTypes.TEXT() + ' CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci',
                allowNull: false,
                field: 'description'
            },
            createdAt: {
                type: DataTypes.DATE(),
                allowNull: false,
                defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
                field: 'created_at',
            },
            balanceIncome: {
                type: DataTypes.FLOAT(12, 4),
                allowNull: false,
                field: 'balance_income'
            },
            balanceOutcome: {
                type: DataTypes.FLOAT(12, 4),
                allowNull: false,
                field: 'balance_outcome'
            },
            balanceOutcome: {
                type: DataTypes.FLOAT(12, 4),
                allowNull: false,
                field: 'balance_outcome'
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
            tableName: 'wallets',
            timestamps: false,
            charset: 'ascii',
            collate: 'ascii_general_ci',
            indexes: [],
            associate: ({
                Wallet,
                OrganizationProfile,
            }) => {
                Wallet.belongsTo(OrganizationProfile, {
                    as: 'organization',
                    foreignKey: 'organizationId',
                    constraints: true,
                })
            },
        },
    )
}
