module.exports = function (sequelize, DataTypes) {
    return sequelize.define(
        'Drive',
        {
            id: {
                type: DataTypes.CHAR(36),
                allowNull: false,
                primaryKey: true,
                field: 'id'
            },
            title: {
                type: DataTypes.STRING(255) + ' CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci',
                allowNull: false,
                field: 'title'
            },
            description: {
                type: DataTypes.STRING(512) + ' CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci',
                allowNull: true,
                field: 'description'
            },
            readOnly: {
                type: DataTypes.BOOLEAN(),
                allowNull: false,
                field: 'read_only'
            },
            isSystem: {
                type: DataTypes.BOOLEAN(),
                allowNull: false,
                field: 'is_system',
                defaultValue: false,
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
            tableName: 'drives',
            charset: 'ascii',
            collate: 'ascii_general_ci',
            indexes: [],
            associate: ({ Drive, OrganizationProfile }) => {
                Drive.belongsTo(OrganizationProfile, {
                    as: 'organization',
                    foreignKey: 'organizationId',
                    constraints: true,
                })
            },
        },
    )
}
