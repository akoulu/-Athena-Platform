'use strict';
// Load .env file if it exists, but don't fail if it doesn't
try {
  require('dotenv').config();
} catch (e) {
  // dotenv not available or .env file doesn't exist - use environment variables only
}

const { Sequelize } = require('sequelize-typescript');
const { Umzug, SequelizeStorage } = require('umzug');

const sequelize = new Sequelize({
  dialect: process.env.DB_DIALECT || 'sqlite',
  storage: process.env.DB_STORAGE || 'data/dev.sqlite',
  host: process.env.DB_HOST,
  port: process.env.DB_PORT ? Number(process.env.DB_PORT) : undefined,
  database: process.env.DB_NAME,
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  logging: false,
  dialectOptions:
    process.env.DB_SSL === 'true' ? { ssl: { require: true, rejectUnauthorized: false } } : {},
});

const umzug = new Umzug({
  migrations: { glob: 'migrations/*.js' },
  context: sequelize.getQueryInterface(),
  storage: new SequelizeStorage({ sequelize }),
  logger: console,
});

const cmd = process.argv[2] || 'up';
umzug[cmd]()
  .then(() => {
    console.log(`Migrations ${cmd} completed`);
    process.exit(0);
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
