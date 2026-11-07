'use strict'

const logger = require('./logger')
const { loadDB } = require('./database')

function startCronJobs(sock) {
  // 1. Auto-Bio Sync (Runs every 30 minutes to ensure it doesn't get wiped by WhatsApp)
  setInterval(async () => {
    const db = loadDB()
    if (db.autoBio) {
      try {
        await sock.updateProfileStatus(db.autoBio)
      } catch (err) {
        logger.error('Failed to sync auto-bio: ' + err.message)
      }
    }
  }, 1800000) // 30 minutes
}

module.exports = { startCronJobs }
