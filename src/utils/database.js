'use strict'

const fs = require('fs')
const path = require('path')
const logger = require('./logger')

const dbPath = path.join(__dirname, '../../data/database.json')

const dataDir = path.dirname(dbPath)
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true })
}

function loadDB() {
  if (!fs.existsSync(dbPath)) {
    fs.writeFileSync(dbPath, JSON.stringify({ settings: {}, prefix: '.', activity: {} }, null, 2))
    return { settings: {}, prefix: '.', activity: {} }
  }
  try {
    const data = JSON.parse(fs.readFileSync(dbPath, 'utf8'))
    if (!data.activity) data.activity = {} // Ensure activity object exists
    return data
  } catch (error) {
    logger.error('Failed to parse database.json. Resetting to default.')
    return { settings: {}, prefix: '.', activity: {} }
  }
}

function saveDB(data) {
  try {
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2))
  } catch (error) {
    logger.error(`Failed to save database: ${error.message}`)
  }
}

function syncConfig(config) {
  const db = loadDB()
  if (db.settings) config.settings = { ...config.settings, ...db.settings }
  if (db.prefix) config.prefix = db.prefix
  return config
}

function updateSetting(key, value) {
  const db = loadDB()
  if (key === 'prefix') db.prefix = value
  else db.settings[key] = value
  saveDB(db)
}

// NEW: Track user activity
function trackActivity(groupJid, userJid) {
  const db = loadDB()
  if (!db.activity[groupJid]) db.activity[groupJid] = {}
  if (!db.activity[groupJid][userJid]) db.activity[groupJid][userJid] = 0
  
  db.activity[groupJid][userJid] += 1
  saveDB(db)
}

module.exports = { loadDB, saveDB, syncConfig, updateSetting, trackActivity }
