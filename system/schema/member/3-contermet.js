module.exports = function (sequelize, DataTypes) {
    const Contermet = sequelize.define(
        'Contermet',
        {
            day: {
                type: DataTypes.INTEGER(11),
                allowNull: false,
                primaryKey: true,
                field: 'day',
            },
            month: {
                type: DataTypes.INTEGER(11),
                allowNull: false,
                primaryKey: true,
                field: 'month',
            },
            year: {
                type: DataTypes.INTEGER(11),
                allowNull: false,
                primaryKey: true,
                field: 'year',
            },
            hour: {
                type: DataTypes.INTEGER(11),
                allowNull: false,
                primaryKey: true,
                field: 'hour',
            },
            chargeValue: {
                type: DataTypes.DECIMAL(12, 4).UNSIGNED,
                allowNull: false,
                field: 'charge_value',
            },
            appName: {
                type: DataTypes.STRING(100),
                allowNull: false,
                primaryKey: true,
                field: 'app_name',
            },
            organizationId: {
                type: DataTypes.CHAR(36),
                allowNull: false,
                primaryKey: true,
                field: '_organization_id',
                references: {
                    model: 'organization_profiles',
                    key: 'organization_id',
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE',
            },
        },
        {
            tableName: 'contermets',
            timestamps: false,
            charset: 'ascii',
            collate: 'ascii_general_ci',
            indexes: [],
            associate: ({
                Contermet,
                OrganizationProfile,
            }) => {
                Contermet.belongsTo(OrganizationProfile, {
                    as: 'organization',
                    foreignKey: 'organizationId',
                    constraints: true,
                })
            },
        },
    )

    Contermet.removeAttribute('id')
    return Contermet
}
