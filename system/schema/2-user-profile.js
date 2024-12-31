module.exports = function (sequelize, DataTypes) {
    const UserProfile = sequelize.define(
        'UserProfile',
        {
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
            firstName: {
                type: DataTypes.STRING(255) + ' CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci',
                allowNull: true,
                field: 'first_name',
            },
            lastName: {
                type: DataTypes.STRING(255) + ' CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci',
                allowNull: true,
                field: 'last_name',
            },
            address: {
                type: DataTypes.STRING(512) + ' CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci',
                allowNull: true,
                field: 'address',
            },
            timeZone: {
                type: DataTypes.INTEGER(3),
                allowNull: true,
                field: 'time_zone',
            },
            facebookId: {
                type: DataTypes.STRING(60),
                allowNull: true,
                field: '_facebook_id',
            },
        },
        {
            tableName: 'user_profiles',
            underscored: true,
            timestamps: false,
            charset: 'ascii',
            collate: 'ascii_general_ci',
            indexes: [],
            associate: ({
                User,
                UserProfile,
            }) => {
                UserProfile.belongsTo(User, {
                    as: 'user',
                    foreignKey: 'userId',
                    constraints: true,
                })
            },
            hooks: {
                afterSync() {
                    $._syncModelSchemas['UserProfile'] = async () => {
                        UserProfile.bulkCreate([
                            ...require('./fixtures/user-profile'),
                        ], {
                            updateOnDuplicate: ['userId']
                        })
                    }
                }
            },
        },
    )

    UserProfile.removeAttribute('id')
    return UserProfile
}
