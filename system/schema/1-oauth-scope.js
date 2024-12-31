module.exports = function (sequelize, DataTypes) {
    const OauthScope = sequelize.define(
        'OauthScope',
        {
            id: {
                type: DataTypes.STRING(255),
                allowNull: false,
                primaryKey: true,
                field: 'id'
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
            scope: {
                type: DataTypes.STRING(200),
                allowNull: false,
                unique: true,
                field: 'scope'
            },
            description: {
                type: DataTypes.TEXT() + ' CHARSET utf8 COLLATE utf8_general_ci',
                allowNull: true,
                field: 'description'
            },
            isDefault: {
                type: DataTypes.BOOLEAN(),
                allowNull: false,
                defaultValue: false,
                field: 'is_default'
            },
        },
        {
            tableName: 'oauth_scopes',
            underscored: true,
            charset: 'ascii',
            collate: 'ascii_general_ci',
            indexes: [],
            hooks: {
                afterSync: async function() {
                    OauthScope.bulkCreate([
                        {
                            id: '1',
                            scope: 'read',
                            isDefault: true,
                        },
                        {
                            id: '2',
                            scope: 'read_write',
                            isDefault: false,
                        },
                    ], {
                        updateOnDuplicate: ['id'] 
                    })
                },
            }
        },
    )

    return OauthScope
}
