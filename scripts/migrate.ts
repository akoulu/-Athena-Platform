/* eslint-disable @typescript-eslint/no-var-requires */
import { Sequelize } from 'sequelize-typescript';
import { Umzug, SequelizeStorage } from 'umzug';

const sequelize = new Sequelize({
  dialect: (process.env.DB_DIALECT as any) || 'sqlite',
  storage: process.env.DB_STORAGE || 'data/dev.sqlite',
  host: process.env.DB_HOST,
  port: process.env.DB_PORT ? Number(process.env.DB_PORT) : undefined,
  database: process.env.DB_NAME,
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  logging: false,
});

const umzug = new Umzug({
  migrations: { glob: 'org/migrations/*.js' },
  context: sequelize.getQueryInterface(),
  storage: new SequelizeStorage({ sequelize }),
  logger: console,
});

const cmd = process.argv[2] || 'up';
umzug[cmd as 'up' | 'down']()
  .then(() => {
    console.log(`Migrations ${cmd} completed`);
    process.exit(0);
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
