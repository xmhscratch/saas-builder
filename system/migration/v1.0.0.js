// const Promise = require('bluebird')

// module.exports = {
//     up: function (queryInterface, Sequelize) {
//         return Promise
//             .each([
//                 queryInterface.addIndex('payments', {
//                     name: 'PAYMENT_USER_ID',
//                     fields: ['_user_id'],
//                 }),

//                 queryInterface.addIndex('users', {
//                     name: 'USER_MEMBER_ID',
//                     fields: ['_member_id'],
//                 }),

//                 queryInterface.addConstraint('payments', ['_user_id'], {
//                     type: 'foreign key',
//                     name: 'PAYMENT_USER_USER_ID',
//                     references: {
//                         table: 'users',
//                         field: 'id'
//                     },
//                     onDelete: 'CASCADE',
//                     onUpdate: 'CASCADE'
//                 }),
//             ], (item) => item)
//             .catch(console.error)
//     },

//     down: function (queryInterface, Sequelize) {
//         return Promise
//             .each([
//                 queryInterface.bulkDelete('crons', { where: Sequelize.literal('true') }),
//                 queryInterface.bulkDelete('apps', { where: Sequelize.literal('true') }),
//                 queryInterface.removeConstraint('payments', 'PAYMENT_USER_USER_ID'),
//                 queryInterface.removeIndex('payments', 'PAYMENT_USER_ID'),
//                 queryInterface.removeIndex('users', 'USER_MEMBER_ID'),
//             ], (item) => item)
//             .catch(console.error)
//     }
// }
