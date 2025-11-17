'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up({ context: qi }) {
    const dt = require('sequelize').DataTypes;
    await qi
      .createTable('reset_tokens', {
        id: { type: dt.INTEGER, primaryKey: true, autoIncrement: true },
        userId: { type: dt.STRING, allowNull: false },
        tokenHash: { type: dt.STRING, allowNull: false },
        expiresAt: { type: dt.DATE, allowNull: false },
        createdAt: { type: dt.DATE, allowNull: false, defaultValue: new Date() },
        updatedAt: { type: dt.DATE, allowNull: false, defaultValue: new Date() },
      })
      .catch((error) => {
        console.error('Migration failed:', error);
        throw error;
      });
    await qi.addIndex('reset_tokens', ['userId']).catch((error) => {
      console.error('Index creation failed:', error);
      throw error;
    });
    await qi.addIndex('reset_tokens', ['expiresAt']).catch((error) => {
      console.error('Index creation failed:', error);
      throw error;
    });
  },
  async down({ context: qi }) {
    await qi.dropTable('reset_tokens').catch((error) => {
      console.error('Migration rollback failed:', error);
      throw error;
    });
  },
};
