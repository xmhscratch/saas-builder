module.exports = function (sequelize, DataTypes) {
    const InvoiceItem = sequelize.define(
        'InvoiceItem',
        {
            id: {
                type: DataTypes.STRING(255),
                allowNull: false,
                primaryKey: true,
                field: 'id',
            },
            walletId: {
                type: DataTypes.STRING(255),
                allowNull: false,
                field: 'wallet_id',
                references: {
                    model: 'wallets',
                    key: 'id',
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE',
            },
            description: {
                type: DataTypes.STRING(512),
                allowNull: true,
                field: 'description',
            },
            quantity: {
                type: DataTypes.INTEGER(11),
                allowNull: false,
                field: 'quantity',
            },
            subTotal: {
                type: DataTypes.DECIMAL(12, 4).UNSIGNED,
                allowNull: false,
                field: 'sub_total',
            },
            startDate: {
                type: DataTypes.DATEONLY(),
                allowNull: false,
                field: 'start_date',
            },
            endDate: {
                type: DataTypes.DATEONLY(),
                allowNull: false,
                field: 'end_date',
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
            tableName: 'invoice_items',
            timestamps: false,
            charset: 'ascii',
            collate: 'ascii_general_ci',
            indexes: [],
            associate: ({
                Wallet,
                InvoiceItem,
                OrganizationProfile,
            }) => {
                InvoiceItem.belongsTo(OrganizationProfile, {
                    as: 'organization',
                    foreignKey: 'organizationId',
                    constraints: true,
                })
                InvoiceItem.belongsTo(Wallet, {
                    as: 'wallet',
                    foreignKey: 'walletId',
                    constraints: true,
                })
            },
        }
    )

    return InvoiceItem
}
