'use strict'

const { Pool } = require('pg')
const logger = require('../utils/logger')

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
})

pool.on('error', (err) => {
  logger.error('Unexpected error on idle PostgreSQL client', err)
})

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool
}
