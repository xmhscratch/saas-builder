module.exports = function (sequelize, DataTypes) {
    const OauthRole = sequelize.define(
        'OauthRole',
        {
            id: {
                type: DataTypes.STRING(20),
                allowNull: false,
                primaryKey: true,
                field: 'id'
            },
            name: {
                type: DataTypes.STRING(50),
                allowNull: false,
                unique: true,
                field: 'name'
            },
            createdAt: {
                type: DataTypes.DATE(),
                allowNull: false,
                defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
                field: 'created_at'
            },
            updatedAt: {
                type: DataTypes.DATE(),
                allowNull: true,
                field: 'updated_at'
            },
            deletedAt: {
                type: DataTypes.DATE(),
                allowNull: true,
                field: 'deleted_at'
            },
        },
        {
            tableName: 'oauth_roles',
            underscored: true,
            charset: 'ascii',
            collate: 'ascii_general_ci',
            indexes: [],
            hooks: {
                afterSync: async function() {
                    OauthRole.bulkCreate([
                        {
                            id: 'superuser',
                            name: 'SuperUser',
                        },
                        {
                            id: 'user',
                            name: 'User',
                        },
                    ], {
                        updateOnDuplicate: ['id'] 
                    })
                },
            }
        },
    )

    return OauthRole
}
