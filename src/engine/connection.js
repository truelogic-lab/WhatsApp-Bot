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

const BOT_ID = process.env.BOT_ID || null
const BOT_PHONE = process.env.BOT_PHONE ? process.env.BOT_PHONE.replace(/\D/g, '') : null
const SESSION_DIR = process.env.SESSION_DIR || config.sessionDir

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

async function connectToWhatsApp(botId = null, sessionData = null, botPhone = null) {
  let state, saveCreds
  let keepAliveInterval = null
  let pairingRequested = false

  // Use per-bot session directory when botId is provided
  const effectiveSessionDir = botId ? path.join(config.sessionDir, botId) : SESSION_DIR

  if (!fs.existsSync(effectiveSessionDir)) {
    fs.mkdirSync(effectiveSessionDir, { recursive: true })
  }

  if (process.env.MONGO_URI) {
    try {
      const authState = await useMongoAuthState(botId)
      state = authState.state
      saveCreds = authState.saveCreds
    } catch (err) {
      const localAuth = await useMultiFileAuthState(effectiveSessionDir)
      state = localAuth.state
      saveCreds = localAuth.saveCreds
    }
  } else {
    const localAuth = await useMultiFileAuthState(effectiveSessionDir)
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

    // ─── QR event → request pairing code ───
    if (qr && !sock.authState.creds.registered && !pairingRequested) {
      pairingRequested = true
      const cleanNumber = (botPhone || BOT_PHONE || '').replace(/\D/g, '')

      if (!cleanNumber) {
        logger.warn(`QR fired for bot ${botId || 'MASTER'} but no phone number available`)
        pairingRequested = false
        return
      }

      try {
        const code = await sock.requestPairingCode(cleanNumber)
        logger.info(`🔐 PAIRING CODE for ${botId || 'MASTER'}: ${code}`)

        // Save to file fallback (for master mode)
        try {
          fs.writeFileSync(path.join(effectiveSessionDir, 'pairing.txt'), code)
        } catch (e) {}

        // ⭐ Save to Supabase — THIS is what the frontend reads
        if (botId) {
          try {
            const supabase = require('../api/supabase')
            await supabase.from('bots').update({
              pairing_code: code,
              pairing_expires_at: new Date(Date.now() + 60000).toISOString(),
              status: 'offline',
              last_error: null
            }).eq('id', botId)
            logger.info(`💾 Pairing code saved to Supabase for bot ${botId}`)
          } catch (dbErr) {
            logger.error(`Failed to save pairing code to Supabase: ${dbErr.message}`)
          }
        }

        // Also report to API (belt & suspenders)
        if (BOT_ID) await reportPairingCode(BOT_ID, code)
      } catch (error) {
        logger.error(`Failed to request pairing code: ${error.message}`)
        pairingRequested = false
      }
    }

    // ─── Connection closed ───
    if (connection === 'close') {
      if (keepAliveInterval) clearInterval(keepAliveInterval)
      const statusCode = lastDisconnect?.error?.output?.statusCode

      // Save offline status to Supabase
      if (botId) {
        try {
          const supabase = require('../api/supabase')
          await supabase.from('bots').update({
            status: 'offline',
            last_error: `Disconnected: ${statusCode || 'unknown'}`
          }).eq('id', botId)
        } catch (dbErr) {}
      }
      if (BOT_ID) await reportStatus(BOT_ID, 'offline', `Disconnected: ${statusCode}`)

      if (statusCode !== DisconnectReason.loggedOut) {
        logger.warn(`Connection closed (Code: ${statusCode}). Reconnecting in 5s...`)
        setTimeout(() => connectToWhatsApp(botId, sessionData, botPhone), 5000)
      } else {
        logger.error('Session logged out. Manual re-pair required.')
        process.exit(1)
      }
    }

    // ─── Connection opened ───
    else if (connection === 'open') {
      logger.info(`✅ Bot ${botId || 'MASTER'} is connected and online.`)
      pairingRequested = false

      // ⭐ Save online status to Supabase
      if (botId) {
        try {
          const supabase = require('../api/supabase')
          await supabase.from('bots').update({
            status: 'online',
            pairing_code: null,
            pairing_expires_at: null,
            last_seen_at: new Date().toISOString(),
            last_error: null
          }).eq('id', botId)
          logger.info(`💾 Bot ${botId} marked online in Supabase`)
        } catch (dbErr) {
          logger.error(`Failed to mark online in Supabase: ${dbErr.message}`)
        }
      }

      if (BOT_ID) await reportStatus(BOT_ID, 'online')

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
