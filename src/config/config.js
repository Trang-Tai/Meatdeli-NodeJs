require('dotenv').config(); // this is important!

const config = {
  development: {
    username: process.env.DB_DEV_USERNAME,
    password: process.env.DB_DEV_PASSWORD,
    database: process.env.DB_DEV_DATABASE_NAME,
    host: process.env.DB_DEV_HOST,
    port: process.env.DB_DEV_PORT,
    dialect: process.env.DB_DEV_DIALECT,
    timezone: "+07:00",
    dialectOptions: process.env.DB_DEV_SSL === 'true' ? 
      {
        ssl: {
          require: true,
          rejectUnauthorized: false
        }
      } : {}
  },
  test: {
    username: "root",
    password: null,
    database: "database_test",
    host: "127.0.0.1",
    dialect: "mysql"
  },
  production: {
    username: process.env.DB_PRO_USERNAME,
    password: process.env.DB_PRO_PASSWORD,
    database: process.env.DB_PRO_DATABASE_NAME,
    host: process.env.DB_PRO_HOST,
    port: process.env.DB_PRO_PORT,
    dialect: process.env.DB_PRO_DIALECT,
    timezone: "+07:00",
    dialectOptions: process.env.DB_PRO_SSL === 'true' ? 
      {
        ssl: {
          require: true,
          rejectUnauthorized: false
        }
      } : {}
  }
}

module.exports = config;