const knexInstance = require('knex')({
    client: 'pg',
    connection: {
      host: process.env.POSTGRES_SERVER,
      user: process.env.POSTGRES_USERNAME,
      password: process.env.POSTGRES_PASSWORD,
      port: process.env.POSTGRES_PORT,
      database: 'Blink'
    }
  });

  module.exports = knexInstance;