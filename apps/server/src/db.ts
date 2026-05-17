import { DataTypes, Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import path from 'path';
import { Pool } from 'pg';

import { migrations } from './migrations';

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const {
  POSTGRES_HOST,
  POSTGRES_USER,
  POSTGRES_PASSWORD,
  POSTGRES_DB,
  POSTGRES_PORT,
} = process.env;

export const sequelize = new Sequelize({
  dialect: 'postgres',
  logging: false,
  host: POSTGRES_HOST || 'localhost',
  port: Number(POSTGRES_PORT),
  username: POSTGRES_USER,
  password: POSTGRES_PASSWORD,
  database: POSTGRES_DB,
});

export const sessionPool = new Pool({
  host: POSTGRES_HOST || 'localhost',
  port: Number(POSTGRES_PORT),
  user: POSTGRES_USER,
  password: POSTGRES_PASSWORD,
  database: POSTGRES_DB,
});

const MIGRATIONS_TABLE = 'SequelizeMeta';

export async function runMigrations() {
  const queryInterface = sequelize.getQueryInterface();

  await queryInterface.createTable(MIGRATIONS_TABLE, {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true,
    },
  }).catch(() => null);

  const [rows] = await sequelize.query(`SELECT name FROM "${MIGRATIONS_TABLE}"`);
  const appliedMigrations = new Set(
    (rows as Array<{ name: string }>).map((row) => row.name)
  );

  for (const migration of migrations) {
    if (appliedMigrations.has(migration.name)) {
      continue;
    }

    await migration.up(queryInterface, sequelize);
    await queryInterface.bulkInsert(MIGRATIONS_TABLE, [{ name: migration.name }]);
  }
}

export async function closeDbConnections() {
  await Promise.all([
    sequelize.close(),
    sessionPool.end(),
  ]);
}

export async function dbConnect() {
  try {
    await sequelize.authenticate();
    await runMigrations();
    await sessionPool.query('SELECT 1');
    console.log('Connection has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    throw error;
  }
}
