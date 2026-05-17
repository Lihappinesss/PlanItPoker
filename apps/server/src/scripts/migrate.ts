import { closeDbConnections, runMigrations, sequelize, sessionPool } from '../db';

async function migrate() {
  try {
    await sequelize.authenticate();
    await sessionPool.query('SELECT 1');
    await runMigrations();
    console.log('Migrations completed successfully.');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exitCode = 1;
  } finally {
    await closeDbConnections();
  }
}

void migrate();
