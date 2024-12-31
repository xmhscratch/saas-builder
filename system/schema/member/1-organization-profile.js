module.exports = function (sequelize, DataTypes) {
    const OrganizationProfile = sequelize.define(
        'OrganizationProfile',
        {
            organizationId: {
                type: DataTypes.CHAR(36),
                allowNull: false,
                primaryKey: true,
                field: 'organization_id',
            },
            officeAddress: {
                type: DataTypes.TEXT,
                allowNull: true,
                field: 'office_address'
            },
            telephone: {
                type: DataTypes.STRING(255),
                allowNull: true,
                field: 'telephone'
            },
            mailbox: {
                type: DataTypes.STRING(512),
                allowNull: true,
                field: 'mailbox'
            },
            website: {
                type: DataTypes.STRING(512),
                allowNull: true,
                field: 'website'
            },
            taxVatNumber: {
                type: DataTypes.STRING(100),
                allowNull: true,
                field: 'tax_vat_number'
            },
            dunsNumber: {
                type: DataTypes.STRING(24),
                allowNull: true,
                field: 'duns_number'
            },
            createdAt: {
                type: DataTypes.DATE(),
                allowNull: false,
                defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
                field: 'created_at',
            },
            updatedAt: {
                type: DataTypes.DATE(),
                allowNull: true,
                field: 'updated_at',
            },
            deletedAt: {
                type: DataTypes.DATE(),
                allowNull: true,
                field: 'deleted_at',
            },
        },
        {
            tableName: 'organization_profiles',
            timestamps: true,
            paranoid: true,
            charset: 'ascii',
            collate: 'ascii_general_ci',
            indexes: [],
            // associate: ({ Organization, OrganizationProfile }) => {
            //     OrganizationProfile.belongsTo(Organization, {
            //         as: 'organization',
            //         foreignKey: 'organizationId',
            //     })
            // },
            hooks: {
                afterSync: async () => {
                    OrganizationProfile.bulkCreate(
                        require('../fixtures/organization-profile'),
                        { updateOnDuplicate: ['organizationId'] },
                    )
                },
            },
        }
    )

    OrganizationProfile.removeAttribute('id')
    return OrganizationProfile
}
