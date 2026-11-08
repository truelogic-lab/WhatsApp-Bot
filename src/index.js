'use strict'

const { connectToWhatsApp } = require('./engine/connection')
const { loadCommands } = require('./handlers/loader')
const { connectDB, syncConfig } = require('./utils/database')
const logger = require('./utils/logger')
const config = require('../config')

let sockInstance = null
let shuttingDown = false

async function start() {
  try {
    logger.info(`Starting ${config.botName} v${config.version}...`)


    await connectDB()
    await syncConfig(config)
    logger.info(`Loaded settings. Mode: ${config.settings.mode}`)

    loadCommands()
    sockInstance = await connectToWhatsApp()
  } catch (error) {
    logger.error(`Startup failed: ${error.stack || error.message}`)
    process.exitCode = 1
  }
}

async function shutdown(signal) {
  if (shuttingDown) return
  shuttingDown = true
  logger.warn(`Received ${signal}. Shutting down gracefully...`)
  if (sockInstance) {
    try {
      await sockInstance.end(new Error('Process shutting down'))
      logger.info('Socket closed successfully.')
    } catch (error) {}
  }
  process.exit(0)
}

process.on('SIGINT', () => shutdown('SIGINT'))
process.on('SIGTERM', () => shutdown('SIGTERM'))

process.on('uncaughtException', (error) => {
  logger.error(`Uncaught exception: ${error.stack || error.message}`)
  process.exit(1)
})

process.on('unhandledRejection', (reason) => {
  logger.error(`Unhandled rejection: ${reason?.stack || reason}`)
})

start()
