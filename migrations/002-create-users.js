'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up({ context: qi }) {
    const dt = require('sequelize').DataTypes;
    await qi
      .createTable('users', {
        id: {
          type: dt.UUID,
          primaryKey: true,
          defaultValue: require('sequelize').Sequelize.literal('gen_random_uuid()'),
        },
        email: { type: dt.STRING, allowNull: false, unique: true },
        username: { type: dt.STRING, allowNull: false, unique: true },
        password: { type: dt.STRING, allowNull: false },
        firstName: { type: dt.STRING, allowNull: true },
        lastName: { type: dt.STRING, allowNull: true },
        roles: { type: dt.JSON, allowNull: false, defaultValue: [] },
        isActive: { type: dt.BOOLEAN, allowNull: false, defaultValue: true },
        createdAt: { type: dt.DATE, allowNull: false, defaultValue: new Date() },
        updatedAt: { type: dt.DATE, allowNull: false, defaultValue: new Date() },
      })
      .catch((error) => {
        console.error('Migration failed:', error);
        throw error;
      });
  },
  async down({ context: qi }) {
    await qi.dropTable('users').catch((error) => {
      console.error('Migration rollback failed:', error);
      throw error;
    });
  },
};
