module.exports = function (sequelize, DataTypes) {
    return sequelize.define(
        'DriveCredential',
        {
            credentialId: {
                type: DataTypes.CHAR(36),
                allowNull: false,
                primaryKey: true,
                field: 'credential_id',
            },
            driveId: {
                type: DataTypes.CHAR(36),
                allowNull: false,
                primaryKey: true,
                field: 'drive_id',
                references: {
                    model: 'drives',
                    key: 'id',
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE',
            },
            createdAt: {
                type: DataTypes.DATE(),
                allowNull: false,
                defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
                field: 'created_at',
            },
        },
        {
            tableName: 'drive_credentials',
            timestamps: false,
            charset: 'ascii',
            collate: 'ascii_general_ci',
            indexes: [],
            associate: ({ DriveCredential, Drive }) => {
                DriveCredential.belongsTo(Drive, {
                    as: 'drive',
                    foreignKey: 'driveId',
                    constraints: true,
                })
            },
        },
    )
}
