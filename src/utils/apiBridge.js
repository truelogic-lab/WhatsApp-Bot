'use strict'

const axios = require('axios')
const logger = require('./logger')

const API_URL = process.env.API_URL || 'http://localhost:5000'
const ENGINE_SECRET = process.env.ENGINE_API_SECRET

const api = axios.create({
  baseURL: API_URL,
  headers: { 'x-engine-secret': ENGINE_SECRET },
  timeout: 10000
})

async function reportPairingCode(botId, code) {
  if (!botId) return
  try {
    await api.post(`/api/bots/engine/${botId}/pairing-code`, { code, ttlSeconds: 60 })
    logger.info(`[API Bridge] Pairing code sent to API`)
  } catch (err) {
    logger.error(`[API Bridge] Failed to send pairing code: ${err.message}`)
  }
}

async function reportStatus(botId, status, lastError = null) {
  if (!botId) return
  try {
    await api.post(`/api/bots/engine/${botId}/status`, { status, lastError })
    logger.info(`[API Bridge] Status '${status}' sent to API`)
  } catch (err) {
    logger.error(`[API Bridge] Failed to send status: ${err.message}`)
  }
}

module.exports = { reportPairingCode, reportStatus }
