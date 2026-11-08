'use strict'

const fs = require('fs')
const path = require('path')
const { MongoClient } = require('mongodb')
const logger = require('./logger')

const dbPath = path.join(__dirname, '../../data/database.json')
const dataDir = path.dirname(dbPath)
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true })

let mongoClient = null
let mongoDb = null
let useMongo = false


async function connectDB() {
  if (process.env.MONGO_URI) {
    try {
      mongoClient = new MongoClient(process.env.MONGO_URI)
      await mongoClient.connect()
      mongoDb = mongoClient.db('WarrenXMD')
      useMongo = true
      logger.info('✅ Connected to MongoDB successfully.')
    } catch (error) {
      logger.error(`MongoDB connection failed: ${error.message}. Falling back to local JSON.`)
      useMongo = false
    }
  } else {
    logger.warn('⚠️ No MONGO_URI found. Using local JSON database.')
  }
}


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
  if (useMongo) {
    const collection = mongoDb.collection('config')
    let doc = await collection.findOne({ _id: 'main' })
    if (!doc) {
      doc = { _id: 'main', settings: {}, prefix: '.', activity: {} }
      await collection.insertOne(doc)
    }
    return doc
  }
  return loadLocal()
}

async function saveDB(data) {
  if (useMongo) {
    const collection = mongoDb.collection('config')
    delete data._id // Remove ID before update
    await collection.updateOne({ _id: 'main' }, { $set: data }, { upsert: true })
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

module.exports = { connectDB, loadDB, saveDB, syncConfig, updateSetting, trackActivity }
