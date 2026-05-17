const { POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_DB, POSTGRES_PORT, POSTGRES_HOST } =
  process.env;

module.exports = {
  "development": {
    "username": POSTGRES_USER,
    "password": POSTGRES_PASSWORD,
    "database": POSTGRES_DB,
    "host": POSTGRES_HOST || "localhost",
    "port": Number(POSTGRES_PORT),
    "dialect": "postgres"
  },
  "test": {
    "username": POSTGRES_USER,
    "password": POSTGRES_PASSWORD,
    "database": POSTGRES_DB,
    "host": POSTGRES_HOST || "localhost",
    "port": Number(POSTGRES_PORT),
    "dialect": "postgres"
  },
  "production": {
    "username": POSTGRES_USER,
    "password": POSTGRES_PASSWORD,
    "database": POSTGRES_DB,
    "host": POSTGRES_HOST || "localhost",
    "port": Number(POSTGRES_PORT),
    "dialect": "postgres"
  }
};
