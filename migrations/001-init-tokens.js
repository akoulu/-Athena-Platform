'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up({ context: qi }) {
    const dt = require('sequelize').DataTypes;
    // refresh_tokens
    await qi
      .createTable('refresh_tokens', {
        id: { type: dt.INTEGER, primaryKey: true, autoIncrement: true },
        userId: { type: dt.STRING, allowNull: false },
        familyId: { type: dt.STRING, allowNull: false },
        tokenHash: { type: dt.STRING, allowNull: false },
        expiresAt: { type: dt.DATE, allowNull: false },
        createdAt: { type: dt.DATE, allowNull: false, defaultValue: new Date() },
        updatedAt: { type: dt.DATE, allowNull: false, defaultValue: new Date() },
      })
      .catch((error) => {
        console.error('Migration failed:', error);
        throw error;
      });
    await qi.addIndex('refresh_tokens', ['familyId']).catch((error) => {
      console.error('Index creation failed:', error);
      throw error;
    });

    // blacklisted_tokens
    await qi
      .createTable('blacklisted_tokens', {
        id: { type: dt.INTEGER, primaryKey: true, autoIncrement: true },
        jti: { type: dt.STRING, allowNull: true },
        tokenHash: { type: dt.STRING, allowNull: false },
        expiresAt: { type: dt.DATE, allowNull: false },
        createdAt: { type: dt.DATE, allowNull: false, defaultValue: new Date() },
        updatedAt: { type: dt.DATE, allowNull: false, defaultValue: new Date() },
      })
      .catch((error) => {
        console.error('Migration failed:', error);
        throw error;
      });
    await qi.addIndex('blacklisted_tokens', ['jti']).catch((error) => {
      console.error('Index creation failed:', error);
      throw error;
    });
  },
  async down({ context: qi }) {
    await qi.dropTable('refresh_tokens').catch((error) => {
      console.error('Migration rollback failed:', error);
      throw error;
    });
    await qi.dropTable('blacklisted_tokens').catch((error) => {
      console.error('Migration rollback failed:', error);
      throw error;
    });
  },
};
