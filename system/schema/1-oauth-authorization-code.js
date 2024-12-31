module.exports = function (sequelize, DataTypes) {
    const OauthAuthorizationCode = sequelize.define(
        'OauthAuthorizationCode',
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
                allowNull: false,
                field: 'user_id',
                references: {
                    model: 'users',
                    key: 'id',
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE',
            },
            code: {
                type: DataTypes.STRING(40),
                allowNull: false,
                unique: true,
                field: 'code'
            },
            redirectUri: {
                type: DataTypes.STRING(200),
                allowNull: true,
                field: 'redirect_uri'
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
            tableName: 'oauth_authorization_codes',
            underscored: true,
            charset: 'ascii',
            collate: 'ascii_general_ci',
            indexes: [],
            associate: ({
                OauthAuthorizationCode,
                User,
                OauthClient,
                OauthScope,
            }) => {
                OauthAuthorizationCode.belongsTo(User, {
                    as: 'user',
                    foreignKey: 'userId',
                    constraints: true,
                })
                OauthAuthorizationCode.belongsTo(OauthClient, {
                    as: 'oauthClient',
                    foreignKey: 'clientId',
                    constraints: true,
                })
                OauthAuthorizationCode.hasOne(OauthScope, {
                    as: 'oauthScope',
                    foreignKey: 'scope',
                    constraints: true,
                })
            },
        },
    )

    return OauthAuthorizationCode
}
