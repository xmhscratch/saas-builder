module.exports = function (sequelize, DataTypes) {
    const OrganizationUser = sequelize.define(
        'OrganizationUser',
        {
            organizationId: {
                type: DataTypes.CHAR(36),
                allowNull: false,
                primaryKey: true,
                field: 'organization_id',
                references: {
                    model: 'organizations',
                    key: 'id',
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE',
            },
            userId: {
                type: DataTypes.CHAR(36),
                allowNull: false,
                primaryKey: true,
                field: 'user_id',
                references: {
                    model: 'users',
                    key: 'id',
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE',
            },
            isOwner: {
                type: DataTypes.BOOLEAN(),
                allowNull: false,
                field: 'is_owner',
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
            deletedAt: {
                type: DataTypes.DATE(),
                allowNull: true,
                field: 'deleted_at',
            },
        },
        {
            tableName: 'organization_users',
            timestamps: true,
            paranoid: true,
            charset: 'ascii',
            collate: 'ascii_general_ci',
            indexes: [],
            associate: ({
                User,
                Organization,
                OrganizationUser,
            }) => {
                OrganizationUser.belongsTo(User, {
                    as: 'user',
                    foreignKey: 'userId',
                    constraints: true,
                })
                OrganizationUser.belongsTo(Organization, {
                    as: 'organization',
                    foreignKey: 'organizationId',
                    constraints: true,
                })
            },
            hooks: {
                afterSync() {
                    $._syncModelSchemas['OrganizationUser'] = async () => {
                        OrganizationUser.bulkCreate([
                            ...require('./fixtures/organization-user'),
                        ], { updateOnDuplicate: ['organizationId', 'userId'] })
                    }
                },
            },
        },
    )

    OrganizationUser.removeAttribute('id')
    return OrganizationUser
}
