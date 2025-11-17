'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up({ context: qi }) {
    const dt = require('sequelize').DataTypes;
    const Sequelize = require('sequelize').Sequelize;
    
    // Detect database dialect
    const dialect = qi.sequelize.getDialect();
    const isPostgreSQL = dialect === 'postgres';
    
    await qi
      .createTable('users', {
        id: {
          type: isPostgreSQL ? dt.UUID : dt.STRING(36),
          primaryKey: true,
          allowNull: false,
          ...(isPostgreSQL 
            ? { defaultValue: Sequelize.literal('gen_random_uuid()') }
            : {}),
        },
        email: { type: dt.STRING, allowNull: false, unique: true },
        username: { type: dt.STRING, allowNull: false, unique: true },
        password: { type: dt.STRING, allowNull: false },
        firstName: { type: dt.STRING, allowNull: true },
        lastName: { type: dt.STRING, allowNull: true },
        roles: { type: dt.JSON, allowNull: false, defaultValue: [] },
        isActive: { type: dt.BOOLEAN, allowNull: false, defaultValue: true },
        createdAt: { type: dt.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
        updatedAt: { type: dt.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
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
