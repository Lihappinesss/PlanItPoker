import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import path from 'path';
import { Pool } from 'pg';

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

export async function dbConnect() {
  try {
    await sequelize.authenticate();
    await sequelize.sync();
    await sessionPool.query('SELECT 1');
    console.log('Connection has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    throw error;
  }
}
