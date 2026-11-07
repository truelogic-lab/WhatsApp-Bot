'use strict'

const pino = require('pino')

// Create a clean logger. Change 'debug' to 'info' later for less terminal noise.
const logger = pino({
  level: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'SYS:standard',
      ignore: 'pid,hostname'
    }
  }
})

module.exports = logger
