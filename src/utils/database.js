'use strict'

const { Pool } = require('pg')
const fs = require('fs')
const path = require('path')
const logger = require('./logger')

// Fallback local JSON path (used if DATABASE_URL is missing)
const dbPath = path.join(__dirname, '../../data/database.json')
const dataDir = path.dirname(dbPath)
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true })

let pool = null

// Initialize Postgres Connection
if (process.env.DATABASE_URL) {
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  })
  logger.info('✅ Connected to Supabase PostgreSQL')
} else {
  logger.warn('⚠️ No DATABASE_URL found. Using local JSON fallback.')
}

// Local JSON Fallback
function loadLocal() {
  if (!fs.existsSync(dbPath)) {
    fs.writeFileSync(dbPath, JSON.stringify({ settings: {}, prefix: '.', activity: {} }, null, 2))
    return { settings: {}, prefix: '.', activity: {} }
  }
  try {
    const data = JSON.parse(fs.readFileSync(dbPath, 'utf8'))
    if (!data.activity) data.activity = {}
    return data
  } catch (error) {
    return { settings: {}, prefix: '.', activity: {} }
  }
}

function saveLocal(data) {
  try {
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2))
  } catch (error) {}
}

// Main Database Functions
async function loadDB() {
  if (pool) {
    const client = await pool.connect()
    try {
      const res = await client.query('SELECT * FROM bot_config WHERE id = 1')
      if (res.rows.length === 0) {
        const defaultData = { settings: {}, prefix: '.', activity: {} }
        await client.query('INSERT INTO bot_config (id, data) VALUES (1, $1)', [defaultData])
        return defaultData
      }
      return res.rows[0].data
    } finally {
      client.release()
    }
  }
  return loadLocal()
}

async function saveDB(data) {
  if (pool) {
    const client = await pool.connect()
    try {
      await client.query('UPDATE bot_config SET data = $1, updated_at = NOW() WHERE id = 1', [data])
    } finally {
      client.release()
    }
    return
  }
  saveLocal(data)
}

async function syncConfig(config) {
  const db = await loadDB()
  if (db.settings) config.settings = { ...config.settings, ...db.settings }
  if (db.prefix) config.prefix = db.prefix
  return config
}

async function updateSetting(key, value) {
  const db = await loadDB()
  if (key === 'prefix') db.prefix = value
  else db.settings[key] = value
  await saveDB(db)
}

async function trackActivity(groupJid, userJid) {
  const db = await loadDB()
  if (!db.activity) db.activity = {}
  if (!db.activity[groupJid]) db.activity[groupJid] = {}
  if (!db.activity[groupJid][userJid]) db.activity[groupJid][userJid] = 0
  
  db.activity[groupJid][userJid] += 1
  await saveDB(db)
}

module.exports = { loadDB, saveDB, syncConfig, updateSetting, trackActivity }
