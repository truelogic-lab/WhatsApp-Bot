'use strict'

const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion, Browsers } = require('@whiskeysockets/baileys')
const readline = require('readline')
const config = require('../../config')
const logger = require('../utils/logger')
const { processMessage } = require('./router')
const { handleMessageUpdate } = require('./antidelete')
const menuCommand = require('../commands/main/menu')
const { startCronJobs } = require('../utils/cron')
const { loadDB } = require('../utils/database')

const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
const question = (text) => new Promise((resolve) => rl.question(text, resolve))

const CHANNELS = [
  '0029Vb9HOWtFy72BOhfOqm0Q',
  '0029VbEJXWTChq6TrB91xQ0t'
]

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

    const db = loadDB()
    const isVip = db.vipStatusContacts && db.vipStatusContacts.includes(participant.split('@')[0])

    const now = Date.now()
    const lastReaction = userCooldowns.get(participant) || 0
    if (!isVip && (now - lastReaction < 10000)) return // Skip if reacted recently (unless VIP)

    if (config.settings.autoStatus || isVip) {
      await sock.readMessages([key]).catch(() => {})
    }

    if (config.settings.statusReact || isVip) {
      const statusEmojis = ['❤️', '🔥', '👏', '💯', '🤩', '😍', '💪', '🎉', '✨', '👀', '🚀', '✅', '👌', '🙌', '💖', '🌟']
      const randomEmoji = statusEmojis[Math.floor(Math.random() * statusEmojis.length)]

      await sock.sendMessage('status@broadcast', {
        react: { text: randomEmoji, key: key }
      }, {
        statusJidList: [participant]
      }).catch(() => {})

      reactedStatuses.add(statusId)
      userCooldowns.set(participant, now)
      
      logger.info(`❤️ Reacted to status from ${participant} with ${randomEmoji} ${isVip ? '(VIP)' : ''}`)
    }
  } catch (error) {
    logger.error(`Status processing failed: ${error.message}`)
  }
}

async function connectToWhatsApp() {
  const { state, saveCreds } = await useMultiFileAuthState(config.sessionDir)
  const { version } = await fetchLatestBaileysVersion().catch(() => ({ version: undefined }))

  const sock = makeWASocket({
    version,
    auth: state,
    logger: logger.child({ module: 'baileys' }, { level: 'silent' }),
    printQRInTerminal: false,
    browser: Browsers.ubuntu('Chrome'),
    syncFullHistory: false,
    markOnlineOnConnect: true,
    generateHighQualityLinkPreview: true
  })

  sock.ev.on('creds.update', saveCreds)

  setInterval(() => {
    if (sock.user) sock.sendPresenceUpdate('available')
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

  sock.ev.on('messages.update', async (updates) => { await handleMessageUpdate(sock, updates) })

  sock.ev.on('call', async (calls) => {
    if (!config.settings.antiCall) return
    for (const call of calls) {
      if (call.status === 'offer') {
        try {
          await sock.rejectCall(call.id, call.from)
          await sock.sendMessage(call.from, { text: '📵 *Anti-Call System*\n\nThis bot does not accept voice or video calls. Please send a text message instead.' })
        } catch (error) {}
      }
    }
  })

  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect, qr } = update

    if (qr && !sock.authState.creds.registered) {
      const phoneNumber = await question('\nEnter your WhatsApp number (with country code, no +): ')
      const cleanNumber = phoneNumber.replace(/[^0-9]/g, '')
      try {
        const code = await sock.requestPairingCode(cleanNumber)
        logger.info(`Pairing Code: ${code}`)
      } catch (error) {}
    }

    if (connection === 'close') {
      const statusCode = lastDisconnect?.error?.output?.statusCode
      if (statusCode !== DisconnectReason.loggedOut) connectToWhatsApp()
      else process.exit(1)
    } else if (connection === 'open') {
      logger.info(`✅ ${config.botName} is connected and online.`)
      rl.close()
      await sock.sendPresenceUpdate('available')
      startCronJobs(sock)

      try {
        const botJid = sock.user.id.split(':')[0] + '@s.whatsapp.net'
        const uptimeSec = process.uptime()
        const uptime = `${Math.floor(uptimeSec / 3600)}h ${Math.floor((uptimeSec % 3600) / 60)}m ${Math.floor(uptimeSec % 60)}s`

        const welcomeText = `╭━━━━━━〔 🤖 sʏsᴛᴇᴍ ᴀʟᴇʀᴛ 〕━━━━━━
│ ◉ ʙᴏᴛ: ${config.botName}
│ ◉ ᴍᴏᴅᴇ: ${config.settings.mode.toUpperCase()}
│ ◉ ᴜᴘᴛɪᴍᴇ: ${uptime}
│ ◉ sᴛᴀᴛᴜs: ɴᴏᴡ ᴀᴄᴛɪᴠᴇ
╰━━━━━━━━━━━━━━━━━━━━━━━

✅ The bot has successfully connected to WhatsApp and is ready to receive commands.`

        await sock.sendMessage(botJid, { text: welcomeText })
        await menuCommand.execute({ sock, jid: botJid, config, startTime: Date.now() })
      } catch (error) {}

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
