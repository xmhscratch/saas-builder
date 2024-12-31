module.exports = function (sequelize, DataTypes) {
    const OauthClient = sequelize.define(
        'OauthClient',
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
            key: {
                type: DataTypes.STRING(254),
                allowNull: false,
                unique: true,
                field: 'key'
            },
            secret: {
                type: DataTypes.STRING(60),
                allowNull: false,
                field: 'secret'
            },
            redirectUri: {
                type: DataTypes.TEXT() + ' CHARSET utf8 COLLATE utf8_general_ci',
                allowNull: true,
                field: 'redirect_uri'
            },
            userId: {
                type: DataTypes.CHAR(36),
                allowNull: false,
                field: 'user_id',
                references: {
                    model: 'users',
                    key: 'id',
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE',
            },
        },
        {
            tableName: 'oauth_clients',
            underscored: true,
            charset: 'ascii',
            collate: 'ascii_general_ci',
            indexes: [],
            associate: ({
                OauthClient,
                User,
            }) => {
                OauthClient.belongsTo(User, {
                    as: 'user',
                    foreignKey: 'userId',
                    constraints: true,
                })
            },
        },
    )

    return OauthClient
}
