module.exports = function (sequelize, DataTypes) {
    const OauthRefreshToken = sequelize.define(
        'OauthRefreshToken',
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
            clientId: {
                type: DataTypes.STRING(255),
                allowNull: false,
                field: 'client_id',
                references: {
                    model: 'oauth_clients',
                    key: 'id',
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE',
            },
            userId: {
                type: DataTypes.STRING(255),
                allowNull: true,
                field: 'user_id',
                references: {
                    model: 'users',
                    key: 'id',
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE',
            },
            token: {
                type: DataTypes.STRING(40),
                allowNull: false,
                unique: true,
                field: 'token'
            },
            expiresAt: {
                type: DataTypes.DATE(),
                allowNull: false,
                field: 'expires_at'
            },
            scope: {
                type: DataTypes.STRING(200),
                allowNull: false,
                field: 'scope',
                references: {
                    model: 'oauth_scopes',
                    key: 'scope',
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE',
            },
        },
        {
            tableName: 'oauth_refresh_tokens',
            underscored: true,
            charset: 'ascii',
            collate: 'ascii_general_ci',
            indexes: [],
            associate: ({
                OauthRefreshToken,
                User,
                OauthClient,
                OauthScope,
            }) => {
                OauthRefreshToken.belongsTo(User, {
                    as: 'user',
                    foreignKey: 'userId',
                    constraints: true,
                })
                OauthRefreshToken.belongsTo(OauthClient, {
                    as: 'oauthClient',
                    foreignKey: 'clientId',
                    constraints: true,
                })
                OauthRefreshToken.hasOne(OauthScope, {
                    as: 'oauthScope',
                    foreignKey: 'scope',
                    constraints: true,
                })
            },
        },
    )

    return OauthRefreshToken
}
