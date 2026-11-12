'use strict'

const { connectToWhatsApp } = require('./engine/connection')
const { loadCommands } = require('./handlers/loader')
const { syncConfig } = require('./utils/database')
const { startAPI } = require('./api/server')
const { startBotManager } = require('./engine/botManager')
const logger = require('./utils/logger')
const config = require('../config')

let sockInstance = null
let shuttingDown = false

async function start() {
  try {
    logger.info(`Starting ${config.botName} SaaS Engine...`)

    // 1. Start Web API
    startAPI()

    // 2. Start Bot Deployment Engine
    startBotManager()

    // 3. Start the Master/Owner Bot (The one you use to control the platform)
    syncConfig(config)
    loadCommands()
    
    sockInstance = await connectToWhatsApp(null, null) // null ID means it's the master bot
    
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
