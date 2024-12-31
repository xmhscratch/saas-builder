module.exports = function (sequelize, DataTypes) {
    const Privilege = sequelize.define(
        'Privilege',
        {
            organizationId: {
                type: DataTypes.CHAR(36),
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
            userId: {
                type: DataTypes.CHAR(36),
                allowNull: false,
                primaryKey: true,
                field: 'user_id'
            },
            resourcePath: {
                type: DataTypes.STRING(60),
                allowNull: false,
                primaryKey: true,
                field: 'resource_path'
            },
            methodName: {
                type: DataTypes.STRING(512),
                allowNull: false,
                primaryKey: true,
                field: 'method_name'
            },
            scope: {
                type: DataTypes.STRING(100),
                allowNull: false,
                field: 'scope',
                defaultValue: 'read',
            },
        },
        {
            tableName: 'privilege',
            charset: 'ascii',
            collate: 'ascii_general_ci',
            indexes: [],
            associate: ({
                Privilege,
                OrganizationProfile,
            }) => {
                Privilege.belongsTo(OrganizationProfile, {
                    as: 'organization',
                    foreignKey: 'organizationId',
                    constraints: true,
                })
            },
        },
    )

    Privilege.removeAttribute('id')
    return Privilege
}
