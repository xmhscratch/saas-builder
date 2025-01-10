module.exports = function (sequelize, DataTypes) {
    const User = sequelize.define(
        'User',
        {
            id: {
                type: DataTypes.CHAR(36),
                allowNull: false,
                primaryKey: true,
                field: 'id',
            },
            password: {
                type: DataTypes.TEXT(),
                allowNull: false,
                field: '_password',
            },
            username: {
                type: DataTypes.STRING(100) + ' CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci',
                allowNull: false,
                unique: true,
                field: 'username',
            },
            emailAddress: {
                type: DataTypes.STRING(100) + ' CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci',
                allowNull: false,
                unique: true,
                field: 'email_address',
            },
            avatar: {
                type: DataTypes.BLOB('medium'),
                allowNull: true,
                field: 'avatar',
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
            roleId: {
                type: DataTypes.STRING(20),
                allowNull: false,
                field: 'role_id',
                defaultValue: 'user',
                references: {
                    model: 'oauth_roles',
                    key: 'id',
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE',
            },
            status: {
                type: DataTypes.INTEGER(1),
                allowNull: false,
                field: 'status',
            },
        },
        {
            tableName: 'users',
            underscored: false,
            charset: 'ascii',
            collate: 'ascii_general_ci',
            associate: ({
                User,
                UserProfile,
                Organization,
                OrganizationUser,
                OauthRole,
            }) => {
                User.hasOne(UserProfile, {
                    as: 'profile',
                    foreignKey: 'userId',
                    constraints: false,
                })
                User.belongsToMany(Organization, {
                    through: { model: OrganizationUser, unique: false },
                    as: 'organizations',
                    foreignKey: 'userId',
                    constraints: false,
                })
                User.belongsTo(OauthRole, {
                    as: 'role',
                    foreignKey: 'roleId',
                    constraints: true,
                })
            },
            hooks: {
                afterSync() {
                    $._syncModelSchemas['User'] = async () => {
                        User.bulkCreate([
                            ...require('./fixtures/user'),
                        ], {
                            updateOnDuplicate: ['id']
                        })
                    }
                }
            },
        },
    )

    return User
}
