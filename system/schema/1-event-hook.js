const objectHash = require('object-hash')

module.exports = function (sequelize, DataTypes) {
    const EventHook = sequelize.define(
        'EventHook',
        {
            handlerId: {
                type: DataTypes.STRING(60),
                allowNull: false,
                primaryKey: true,
                field: 'handler_id'
            },
            topicName: {
                type: DataTypes.STRING(100),
                allowNull: false,
                field: 'topic_name'
            },
            action: {
                type: DataTypes.STRING(60),
                allowNull: false,
                field: 'action'
            },
            triggerCondition: {
                type: DataTypes.TEXT(),
                allowNull: false,
                field: 'trigger_condition'
            },
            actionUrl: {
                type: DataTypes.TEXT() + ' CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci',
                allowNull: false,
                field: 'action_url'
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
        },
        {
            tableName: 'event_hooks',
            timestamps: false,
            charset: 'ascii',
            collate: 'ascii_general_ci',
            indexes: [],
            hooks: {
                afterSync() {
                    $._syncModelSchemas['EventHook'] = async () => {
                        const eventHookGenerator = require('./fixtures/event-hook')
                        const eventInfos = eventHookGenerator()

                        EventHook.bulkCreate(
                            _.map(eventInfos, (eventInfo) => {
                                const {
                                    topicName,
                                    action,
                                    triggerCondition,
                                } = eventInfo

                                const handlerId = objectHash({
                                    topicName, action, triggerCondition
                                })

                                return { handlerId, ...eventInfo }
                            }),
                            { updateOnDuplicate: ['handlerId'] },
                        )
                    }
                }
            }
        }
    )

    EventHook.removeAttribute('id')
    return EventHook
}
