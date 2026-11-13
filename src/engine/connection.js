'use strict'

const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion, Browsers } = require('@whiskeysockets/baileys')
const fs = require('fs')
const path = require('path')
const config = require('../../config')
const logger = require('../utils/logger')
const { processMessage, processGroupUpdate, processMessageUpdate } = require('./router')
const { handleMessageUpdate } = require('./antidelete')
const menuCommand = require('../commands/main/menu')
const { startCronJobs } = require('../utils/cron')
const { loadDB } = require('../utils/database')

const BOT_PHONE = process.env.BOT_PHONE ? process.env.BOT_PHONE.replace(/\D/g, '') : null
const SESSION_DIR = process.env.SESSION_DIR || config.sessionDir

async function connectToWhatsApp() {
  let state, saveCreds
  let keepAliveInterval = null
  let pairingRequested = false

  if (!fs.existsSync(SESSION_DIR)) fs.mkdirSync(SESSION_DIR, { recursive: true })

  const { state: localState, saveCreds: localSaveCreds } = await useMultiFileAuthState(SESSION_DIR)
  state = localState
  saveCreds = localSaveCreds

  const { version } = await fetchLatestBaileysVersion().catch(() => ({ version: undefined }))

  const sock = makeWASocket({
    version,
    auth: state,
    logger: logger.child({ module: 'baileys' }, { level: 'silent' }),
    printQRInTerminal: false,
    browser: Browsers.ubuntu('Chrome'),
    syncFullHistory: false,
    markOnlineOnConnect: config.settings.alwaysOnline,
    generateHighQualityLinkPreview: true
  })

  sock.ev.on('creds.update', saveCreds)

  keepAliveInterval = setInterval(() => {
    if (sock.user && config.settings.alwaysOnline) sock.sendPresenceUpdate('available').catch(() => {})
  }, 240000)

  sock.ev.on('messages.upsert', async (m) => {
    if (m.type !== 'notify') return
    for (const msg of m.messages) {
      const remoteJid = msg.key?.remoteJid
      if (remoteJid === 'status@broadcast') continue
      await processMessage(sock, msg)
    }
  })

  const onMessagesUpdate = async (updates) => {
    await handleMessageUpdate(sock, updates)
    await processMessageUpdate(sock, updates)
  }

  const onCall = async (calls) => {
    if (!config.settings.antiCall) return
    for (const call of calls) {
      if (call.status === 'offer') {
        try {
          await sock.rejectCall(call.id, call.from)
          await sock.sendMessage(call.from, { text: '📵 *Anti-Call System*\n\nThis bot does not accept voice or video calls.' })
        } catch (error) {}
      }
    }
  }

  const onGroupUpdate = async (update) => { await processGroupUpdate(sock, update) }

  sock.ev.on('messages.update', onMessagesUpdate)
  sock.ev.on('call', onCall)
  sock.ev.on('group-participants.update', onGroupUpdate)

  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect, qr } = update

    if (qr && !sock.authState.creds.registered && !pairingRequested) {
      pairingRequested = true

      if (BOT_PHONE) {
        try {
          const code = await sock.requestPairingCode(BOT_PHONE)
          
          logger.info(`\n=========================================`)
          logger.info(`🔐 PAIRING CODE: ${code}`)
          logger.info(`⚠️  EXPIRES IN 60 SECONDS!`)
          logger.info(`=========================================\n`)
          
          fs.writeFileSync(path.join(SESSION_DIR, 'pairing.txt'), code)
        } catch (error) {
          logger.error(`Failed to request code: ${error.message}`)
          pairingRequested = false
        }
      }
    }

    if (connection === 'close') {
      if (keepAliveInterval) clearInterval(keepAliveInterval)
      const statusCode = lastDisconnect?.error?.output?.statusCode
      
      if (statusCode === DisconnectReason.loggedOut) {
        logger.error(`❌ Session logged out. Deleting session and restarting...`)
        // Delete session so we can get a new code
        fs.rmSync(SESSION_DIR, { recursive: true, force: true })
        setTimeout(() => connectToWhatsApp(), 3000)
      } else {
        logger.warn(`Connection closed (Code: ${statusCode}). Reconnecting in 5s...`)
        setTimeout(() => connectToWhatsApp(), 5000)
      }
    } else if (connection === 'open') {
      logger.info(`✅ ${config.botName} is connected and online.`)
      pairingRequested = false

      if (config.settings.alwaysOnline) await sock.sendPresenceUpdate('available').catch(() => {})
      startCronJobs(sock)
    }
  })

  return sock
}

module.exports = { connectToWhatsApp }
