module.exports = function (sequelize, DataTypes) {
    return sequelize.define(
        'Credential',
        {
            id: {
                type: DataTypes.CHAR(36),
                allowNull: false,
                primaryKey: true,
                field: 'id'
            },
            accountId: {
                type: DataTypes.CHAR(36),
                allowNull: false,
                unique: 'unq_user_organization',
                field: 'account_id'
            },
            organizationId: {
                type: DataTypes.CHAR(36),
                allowNull: false,
                unique: 'unq_user_organization',
                field: 'organization_id',
                references: {
                    model: 'organization_profiles',
                    key: 'organization_id',
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE',
            },
            isOwner: {
                type: DataTypes.BOOLEAN(),
                allowNull: false,
                defaultValue: true,
                field: 'is_owner'
            },
        },
        {
            timestamps: false,
            tableName: 'credentials',
            charset: 'ascii',
            collate: 'ascii_general_ci',
            indexes: [],
            associate: ({ Credential, OrganizationProfile }) => {
                Credential.belongsTo(OrganizationProfile, {
                    as: 'organization',
                    foreignKey: 'organizationId',
                    constraints: true,
                })
            },
        },
    )
}
