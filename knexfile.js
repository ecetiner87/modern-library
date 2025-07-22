require('dotenv').config();

module.exports = {
  development: {
    client: process.env.DB_CLIENT || 'postgresql',
    connection: process.env.DB_CLIENT === 'sqlite3' ? {
      filename: process.env.DB_FILENAME || './database.sqlite'
    } : {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      database: process.env.DB_NAME || 'modern_library',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'password'
    },
    migrations: {
      directory: './database/migrations'
    },
    seeds: {
      directory: './database/seeds'
    },
    useNullAsDefault: true // Required for SQLite
  },

  sqlite: {
    client: 'sqlite3',
    connection: {
      filename: './database.sqlite'
    },
    migrations: {
      directory: './database/migrations'
    },
    seeds: {
      directory: './database/seeds'
    },
    useNullAsDefault: true
  },

  production: {
    client: 'postgresql',
    connection: {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT || 5432,
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
    },
    migrations: {
      directory: './database/migrations'
    },
    seeds: {
      directory: './database/seeds'
    }
  }
}; 