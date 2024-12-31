module.exports = function (sequelize, DataTypes) {
    const IntegrationGoogle = sequelize.define(
        'IntegrationGoogle',
        {
            organizationId: {
                type: DataTypes.STRING(36),
                allowNull: false,
                primaryKey: true,
                field: 'organization_id',
                references: {
                    model: 'organization_profiles',
                    key: 'organization_id',
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE',
            },
            createdTime: {
                type: 'TIMESTAMP',
                allowNull: true,
                field: 'created_time',
                defaultValue: null,
            },
            clientId: {
                type: DataTypes.STRING(100),
                allowNull: true,
                field: 'client_id'
            },
            clientSecret: {
                type: DataTypes.STRING(100),
                allowNull: true,
                field: 'client_secret'
            },
            state: {
                type: DataTypes.STRING(60),
                allowNull: true,
                field: 'state'
            },
            updatedAt: {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: sequelize.fn('CURRENT_TIMESTAMP'),
                field: 'updated_at'
            },
            expiresIn: {
                type: DataTypes.DATE,
                allowNull: true,
                field: 'expires_in'
            },
            accessToken: {
                type: DataTypes.TEXT,
                allowNull: true,
                field: 'access_token'
            },
            tokenType: {
                type: DataTypes.STRING(60),
                allowNull: true,
                field: 'token_type'
            },
            code: {
                type: DataTypes.STRING(255),
                allowNull: true,
                field: 'code'
            },
            scopes: {
                type: DataTypes.TEXT,
                allowNull: true,
                field: 'scopes'
            },
        },
        {
            tableName: 'integration_google',
            timestamps: false,
            charset: 'ascii',
            collate: 'ascii_general_ci',
            indexes: [],
            associate: ({
                IntegrationGoogle,
                OrganizationProfile,
            }) => {
                IntegrationGoogle.belongsTo(OrganizationProfile, {
                    as: 'organization',
                    foreignKey: 'organizationId',
                    constraints: true,
                })
            },
        },
    )

    IntegrationGoogle.removeAttribute('id')
    return IntegrationGoogle
}
