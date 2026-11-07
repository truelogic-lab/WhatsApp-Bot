'use strict'

const { connectToWhatsApp } = require('./engine/connection')
const { loadCommands } = require('./handlers/loader')
const { syncConfig } = require('./utils/database')
const logger = require('./utils/logger')
const config = require('../config')

let sockInstance = null

async function start() {
  logger.info(`Starting ${config.botName} v${config.version}...`)
  
  // 1. Load saved settings from database into config
  syncConfig(config)
  logger.info(`Loaded settings. Mode: ${config.settings.mode}`)

  // 2. Load all commands
  loadCommands()
  
  // 3. Connect to WhatsApp
  sockInstance = await connectToWhatsApp()
}

const shutdown = async (signal) => {
  logger.warn(`Received ${signal}. Shutting down gracefully...`)
  if (sockInstance) {
    try {
      await sockInstance.end(undefined)
      logger.info('Socket closed successfully.')
    } catch (e) {
      logger.error('Error closing socket: ' + e.message)
    }
  }
  process.exit(0)
}

process.on('SIGINT', () => shutdown('SIGINT'))
process.on('SIGTERM', () => shutdown('SIGTERM'))

process.on('uncaughtException', (err) => {
  if (err.message && err.message.includes('Bad MAC')) return
  logger.error('Uncaught Exception: ' + err.message)
})

process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled Rejection: ' + reason)
})

start()
