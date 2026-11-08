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
    fs.writeFileSync(dbPath, JSON.stringify({ settings: {}, prefix: '.' }, null, 2))
    return { settings: {}, prefix: '.' }
  }
  try {
    return JSON.parse(fs.readFileSync(dbPath, 'utf8'))
  } catch (error) {
    logger.error('Failed to parse database.json. Resetting to default.')
    return { settings: {}, prefix: '.' }
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
  
  if (db.settings) {
    config.settings = { ...config.settings, ...db.settings }
  }
  
  if (db.prefix) {
    config.prefix = db.prefix
  }
  
  return config
}

function updateSetting(key, value) {
  const db = loadDB()
  
  if (key === 'prefix') {
    db.prefix = value
  } else {
    db.settings[key] = value
  }
  
  saveDB(db)
}

module.exports = { loadDB, saveDB, syncConfig, updateSetting }
