module.exports = function (sequelize, DataTypes) {
    const Payment = sequelize.define(
        'Payment',
        {
            id: {
                type: DataTypes.INTEGER(11),
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                field: 'id'
            },
            reservedCode: {
                type: DataTypes.STRING(8),
                allowNull: false,
                field: 'reserved_code'
            },
            method: {
                type: DataTypes.STRING(100),
                allowNull: false,
                field: 'method'
            },
            requestUrl: {
                type: DataTypes.TEXT(),
                allowNull: true,
                field: 'request_url'
            },
            couponCode: {
                type: DataTypes.STRING(255),
                allowNull: true,
                field: 'coupon_code'
            },
            discountAmount: {
                type: DataTypes.DECIMAL(12, 4).UNSIGNED,
                allowNull: true,
                field: 'discount_amount'
            },
            discountCanceled: {
                type: DataTypes.DECIMAL(12, 4).UNSIGNED,
                allowNull: true,
                field: 'discount_canceled'
            },
            discountInvoiced: {
                type: DataTypes.DECIMAL(12, 4).UNSIGNED,
                allowNull: true,
                field: 'discount_invoiced'
            },
            discountRefunded: {
                type: DataTypes.DECIMAL(12, 4).UNSIGNED,
                allowNull: true,
                field: 'discount_refunded'
            },
            grandTotal: {
                type: DataTypes.DECIMAL(12, 4).UNSIGNED,
                allowNull: true,
                field: 'grand_total'
            },
            totalCanceled: {
                type: DataTypes.DECIMAL(12, 4).UNSIGNED,
                allowNull: true,
                field: 'total_canceled'
            },
            totalInvoiced: {
                type: DataTypes.DECIMAL(12, 4).UNSIGNED,
                allowNull: true,
                field: 'total_invoiced'
            },
            totalPaid: {
                type: DataTypes.DECIMAL(12, 4).UNSIGNED,
                allowNull: true,
                field: 'total_paid'
            },
            totalRefunded: {
                type: DataTypes.DECIMAL(12, 4).UNSIGNED,
                allowNull: true,
                field: 'total_refunded'
            },
            adjustmentNegative: {
                type: DataTypes.DECIMAL(12, 4).UNSIGNED,
                allowNull: true,
                field: 'adjustment_negative'
            },
            adjustmentPositive: {
                type: DataTypes.DECIMAL(12, 4).UNSIGNED,
                allowNull: true,
                field: 'adjustment_positive'
            },
            globalCurrencyCode: {
                type: DataTypes.STRING(3),
                allowNull: true,
                field: 'global_currency_code'
            },
            createdAt: {
                type: DataTypes.DATE(),
                allowNull: false,
                defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
                field: 'created_at',
            },
            updatedAt: {
                type: DataTypes.DATE(),
                allowNull: true,
                field: 'updated_at',
            },
            status: {
                type: DataTypes.STRING(32),
                allowNull: true,
                field: 'status'
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
            tableName: 'payments',
            underscored: true,
            charset: 'ascii',
            collate: 'ascii_general_ci',
            indexes: [],
            associate: ({
                Payment,
                OrganizationProfile,
            }) => {
                Payment.belongsTo(OrganizationProfile, {
                    as: 'organization',
                    foreignKey: 'organizationId',
                    constraints: true,
                })
            },
        },
    )

    return Payment
}
