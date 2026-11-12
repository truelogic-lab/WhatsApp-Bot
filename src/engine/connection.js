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
const { useMongoAuthState } = require('../utils/sessionStore')
const { reportPairingCode, reportStatus } = require('../utils/apiBridge')

const CHANNELS = ['0029Vb9HOWtFy72BOhfOqm0Q', '0029VbEJXWTChq6TrB91xQ0t']

const reactedStatuses = new Set()
const userCooldowns = new Map()
let statusQueue = Promise.resolve()

async function processStatus(sock, msg) {
  try {
    const key = msg.key
    const participant = key?.participant || key?.remoteJid
    if (!key?.id || !participant || key.fromMe) return

    const statusId = `${participant}:${key.id}`
    if (reactedStatuses.has(statusId)) return

    const db = await loadDB()
    const isVip = db.vipStatusContacts && db.vipStatusContacts.includes(participant.split('@')[0])
    const now = Date.now()
    const lastReaction = userCooldowns.get(participant) || 0
    if (!isVip && (now - lastReaction < 10000)) return

    if (config.settings.autoStatus || isVip) await sock.readMessages([key]).catch(() => {})
    if (config.settings.statusReact || isVip) {
      const statusEmojis = config.settings.ownerEmojis.split(',')
      const randomEmoji = statusEmojis[Math.floor(Math.random() * statusEmojis.length)]
      await sock.sendMessage('status@broadcast', { react: { text: randomEmoji, key: key } }, { statusJidList: [participant] }).catch(() => {})
      reactedStatuses.add(statusId)
      userCooldowns.set(participant, now)
      if (reactedStatuses.size > 5000) reactedStatuses.clear()
      if (userCooldowns.size > 1000) userCooldowns.clear()
    }
  } catch (error) {}
}

async function connectToWhatsApp(botId = null, phone = null) {
  let state, saveCreds
  let keepAliveInterval = null
  let pairingRequested = false

  const BOT_ID = botId || process.env.BOT_ID || null
  const BOT_PHONE = phone ? phone.replace(/\D/g, '') : (process.env.BOT_PHONE ? process.env.BOT_PHONE.replace(/\D/g, '') : null)
  const SESSION_DIR = BOT_ID ? `./data/sessions/${BOT_ID}` : (process.env.SESSION_DIR || config.sessionDir)

  if (!fs.existsSync(SESSION_DIR)) fs.mkdirSync(SESSION_DIR, { recursive: true })

  if (process.env.MONGO_URI) {
    try {
      const authState = await useMongoAuthState()
      state = authState.state
      saveCreds = authState.saveCreds
    } catch (err) {
      const localAuth = await useMultiFileAuthState(SESSION_DIR)
      state = localAuth.state
      saveCreds = localAuth.saveCreds
    }
  } else {
    const localAuth = await useMultiFileAuthState(SESSION_DIR)
    state = localAuth.state
    saveCreds = localAuth.saveCreds
  }

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
      if (remoteJid === 'status@broadcast') {
        statusQueue = statusQueue.then(() => processStatus(sock, msg))
        continue
      }
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
          await sock.sendMessage(call.from, { text: '📵 *Anti-Call System*\n\nThis bot does not accept voice or video calls. Please send a text message instead.' })
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
          logger.info(`🔐 PAIRING CODE for ${BOT_ID || 'MASTER'}: ${code}`)

          fs.writeFileSync(path.join(SESSION_DIR, 'pairing.txt'), code)

          if (BOT_ID) {
            try {
              await reportPairingCode(BOT_ID, code)
            } catch (err) {
              logger.error(`[Connection] Failed to report pairing code: ${err.message}`)
            }
          }
        } catch (error) {
          logger.error(`Failed to request code: ${error.message}`)
          pairingRequested = false
        }
      }
    }

    if (connection === 'close') {
      if (keepAliveInterval) clearInterval(keepAliveInterval)
      const statusCode = lastDisconnect?.error?.output?.statusCode
      if (statusCode !== DisconnectReason.loggedOut) {
        logger.warn(`Connection closed for ${BOT_ID || 'MASTER'} (Code: ${statusCode}). Reconnecting in 5s...`)
        if (BOT_ID) {
          try { await reportStatus(BOT_ID, 'offline', `Disconnected: ${statusCode}`) } catch (e) {}
        }
        setTimeout(() => connectToWhatsApp(botId, phone), 5000)
      } else {
        logger.error(`Session logged out for ${BOT_ID || 'MASTER'}.`)
        if (BOT_ID) {
          try { await reportStatus(BOT_ID, 'offline', 'Logged out') } catch (e) {}
        }
        process.exit(1)
      }
    } else if (connection === 'open') {
      logger.info(`✅ Bot ${BOT_ID || 'MASTER'} is connected and online.`)
      pairingRequested = false
      if (BOT_ID) {
        try { await reportStatus(BOT_ID, 'online') } catch (e) {}
      }

      if (config.settings.alwaysOnline) await sock.sendPresenceUpdate('available').catch(() => {})
      startCronJobs(sock)

      setTimeout(async () => {
        for (const inviteCode of CHANNELS) {
          try {
            const metadata = await sock.newsletterMetadata('invite', inviteCode)
            if (metadata?.id) await sock.newsletterFollow(metadata.id)
          } catch (error) {}
        }
      }, 5000)
    }
  })

  return sock
}

module.exports = { connectToWhatsApp }
