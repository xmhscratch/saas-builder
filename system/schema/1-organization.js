module.exports = function (sequelize, DataTypes) {
    const Organization = sequelize.define(
        'Organization',
        {
            id: {
                type: DataTypes.CHAR(36),
                allowNull: false,
                primaryKey: true,
                field: 'id'
            },
            businessId: {
                type: DataTypes.STRING(255),
                allowNull: false,
                unique: true,
                field: 'business_id'
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
            isVerified: {
                type: DataTypes.BOOLEAN(),
                allowNull: false,
                field: 'is_verified',
                defaultValue: false,
            },
            hasWebsiteIntegrated: {
                type: DataTypes.BOOLEAN(),
                allowNull: false,
                field: 'has_website_integrated',
                defaultValue: false,
            },
            ownerId: {
                type: DataTypes.CHAR(36),
                allowNull: false,
                field: 'owner_id'
            },
            memberId: {
                type: DataTypes.CHAR(6),
                allowNull: false,
                field: '_member_id'
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
            deletedAt: {
                type: DataTypes.DATE(),
                allowNull: true,
                field: 'deleted_at',
            },
        },
        {
            tableName: 'organizations',
            timestamps: true,
            paranoid: true,
            charset: 'ascii',
            collate: 'ascii_general_ci',
            indexes: [
                {
                    name: 'idx_member_id',
                    fields: ['_member_id'],
                    method: 'BTREE',
                },
            ],
            associate: ({
                User,
                Organization,
                OrganizationUser,
            }) => {
                Organization.belongsToMany(User, {
                    through: { model: OrganizationUser, unique: false },
                    as: 'users',
                    foreignKey: 'organizationId',
                    constraints: false,
                })
            },
            hooks: {
                afterSync() {
                    $._syncModelSchemas['Organization'] = async () => {
                        Organization.bulkCreate([
                            ...require('./fixtures/organization')
                        ], { updateOnDuplicate: ['id'] })
                    }
                },
            },
        },
    )

    return Organization
}
