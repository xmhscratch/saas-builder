module.exports = function (sequelize, DataTypes) {
    const Integration = sequelize.define(
        'Integration',
        {
            typeName: {
                type: DataTypes.STRING(100),
                allowNull: false,
                primaryKey: true,
                field: 'type_name',
            },
            hasCompleted: {
                type: DataTypes.BOOLEAN(),
                allowNull: false,
                field: 'has_completed',
                defaultValue: false,
            },
            organizationId: {
                type: DataTypes.STRING(36),
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
            tableName: 'integrations',
            underscored: false,
            timestamps: false,
            charset: 'ascii',
            collate: 'ascii_general_ci',
            indexes: [],
            associate: ({
                Integration,
                OrganizationProfile,
            }) => {
                Integration.belongsTo(OrganizationProfile, {
                    as: 'organization',
                    foreignKey: 'organizationId',
                    constraints: true,
                })
            },
        },
    )

    Integration.removeAttribute('id')
    return Integration
}
