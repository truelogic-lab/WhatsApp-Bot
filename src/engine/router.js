'use strict'

const config = require('../../config')
const logger = require('../utils/logger')
const { handleCommand } = require('../handlers/command')
const { cacheMessage } = require('./antidelete')
const { checkAntiLink } = require('./antilink')
const { loadDB, trackActivity } = require('../utils/database')
const { getOwnerNumber } = require('../handlers/permissions')
const { downloadMediaMessage } = require('@whiskeysockets/baileys')

const invitedUsers = new Set()
const repliedUsers = new Set()

const VV_KEYWORDS = ['cute', 'ohh', 'nice', 'beautiful', 'wow', 'omg', 'amazing']
const SAVE_KEYWORDS = ['send', 'sendme', 'do', 'give']

async function processMessage(sock, msg) {
  try {
    // --- ANTI-STATUS MENTION ---
    if (msg.key.remoteJid === 'status@broadcast') {
      if (config.settings.antiStatusMention && !msg.key.fromMe) {
        const botNumber = getOwnerNumber()
        
        if (msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.includes(`${botNumber}@s.whatsapp.net`)) {
          const offender = msg.key.participant || msg.key.remoteJid
          logger.info(`⚠️ Anti-Status Mention triggered by ${offender}`)
          
          const groups = await sock.groupFetchAllParticipating()
          for (const groupJid of Object.keys(groups)) {
            const isMember = groups[groupJid].participants.find(p => p.id === offender)
            if (isMember) {
              try {
                await sock.groupParticipantsUpdate(groupJid, [offender], 'remove')
                await sock.sendMessage(groupJid, { text: `🚫 *Anti-Status Mention*\n\n@${offender.split('@')[0]} was kicked for mentioning the owner in a status.`, mentions: [offender] })
              } catch (e) {}
            }
          }
        }
      }
      return
    }

    if (!msg.message) return

    const sender = msg.key.participant || msg.key.remoteJid
    const isOwner = sender.includes(getOwnerNumber()) || msg.key.fromMe

    // --- ACTIVITY TRACKING ---
    if (msg.key.remoteJid.endsWith('@g.us') && !msg.key.fromMe) {
      trackActivity(msg.key.remoteJid, sender)
    }

    // --- EXTRACT TEXT ---
    let text = ''
    const msgType = Object.keys(msg.message)[0]
    
    if (msgType === 'conversation') text = msg.message.conversation
    else if (msgType === 'extendedTextMessage') text = msg.message.extendedTextMessage.text
    else if (msgType === 'imageMessage' && msg.message.imageMessage.caption) text = msg.message.imageMessage.caption
    else if (msgType === 'videoMessage' && msg.message.videoMessage.caption) text = msg.message.videoMessage.caption

    const lowerText = text.toLowerCase().trim()
    const contextInfo = msg.message.extendedTextMessage?.contextInfo

    // --- STATUS SAVER ---
    if (SAVE_KEYWORDS.includes(lowerText) && contextInfo && contextInfo.remoteJid === 'status@broadcast') {
      await sock.sendMessage(msg.key.remoteJid, { react: { text: '⏳', key: msg.key } }).catch(() => {})
      try {
        const quotedMsg = contextInfo.quotedMessage
        const targetMsg = { key: { remoteJid: 'status@broadcast', id: contextInfo.stanzaId, participant: contextInfo.participant }, message: quotedMsg }
        const buffer = await downloadMediaMessage(targetMsg, 'buffer', {}, { logger: console })
        const targetChat = msg.key.remoteJid 
        if (quotedMsg.imageMessage) await sock.sendMessage(targetChat, { image: buffer, caption: '✨ *WhatsApp Status Saved*' })
        else if (quotedMsg.videoMessage) await sock.sendMessage(targetChat, { video: buffer, caption: '✨ *WhatsApp Status Saved*' })
        await sock.sendMessage(msg.key.remoteJid, { react: { text: '✅', key: msg.key } }).catch(() => {})
      } catch (err) {
        await sock.sendMessage(msg.key.remoteJid, { react: { text: '❌', key: msg.key } }).catch(() => {})
      }
      return
    }

    // --- HIDDEN VV ---
    if (VV_KEYWORDS.includes(lowerText) && contextInfo) {
      const quotedMsg = contextInfo.quotedMessage
      let mediaMsg = null
      if (quotedMsg.viewOnceMessage?.message) mediaMsg = quotedMsg.viewOnceMessage.message
      else if (quotedMsg.viewOnceMessageV2?.message) mediaMsg = quotedMsg.viewOnceMessageV2.message
      else if (quotedMsg.viewOnceMessageV2Extension?.message) mediaMsg = quotedMsg.viewOnceMessageV2Extension.message
      else if (quotedMsg.imageMessage) mediaMsg = quotedMsg
      else if (quotedMsg.videoMessage) mediaMsg = quotedMsg

      if (mediaMsg && (mediaMsg.imageMessage || mediaMsg.videoMessage)) {
        await sock.sendMessage(msg.key.remoteJid, { react: { text: '⏳', key: msg.key } }).catch(() => {})
        try {
          const mockMsg = { key: { ...msg.key, id: contextInfo.stanzaId }, message: mediaMsg }
          const buffer = await downloadMediaMessage(mockMsg, 'buffer', {}, { logger: console })
          if (mediaMsg.imageMessage) await sock.sendMessage(msg.key.remoteJid, { image: buffer, caption: '🔓 Revealed.' })
          else await sock.sendMessage(msg.key.remoteJid, { video: buffer, caption: '🔓 Revealed.' })
          await sock.sendMessage(msg.key.remoteJid, { react: { text: '✅', key: msg.key } }).catch(() => {})
        } catch (err) {}
        return
      }
    }

    // --- AUTO-REPLY ---
    if (config.settings.autoReply && !isOwner && !msg.key.remoteJid.endsWith('@g.us') && !msg.key.remoteJid.endsWith('@newsletter')) {
      if (!repliedUsers.has(sender)) {
        repliedUsers.add(sender)
        setTimeout(() => repliedUsers.delete(sender), 3600000)
        const db = await loadDB()
        const awayMsg = db.autoReplyMessage || 'I am currently away. I will reply soon.'
        await sock.sendMessage(msg.key.remoteJid, { text: `🤖 *Auto-Reply:*\n\n${awayMsg}` })
      }
    }

    // --- AUTOMATIC CHANNEL REACTIONS (HARDCODED) ---
    if (msg.key.remoteJid.endsWith('@newsletter')) {
      // No toggle check anymore, it always reacts!
      if (
        msg.message &&
        msg.key.id &&
        !msg.message.reactionMessage &&
        !msg.message.protocolMessage
      ) {
        const channelEmojis = [
          '🔥', '❤️', '👏', '💯', '🤩', '😍', '💪', '🎉', 
          '✨', '👀', '🚀', '✅', '🥰', '⚡', '🙌', '👑', 
          '🌟', '💥', '🎯', '🏆', '😎', '🫡'
        ]
        const randomEmoji = channelEmojis[Math.floor(Math.random() * channelEmojis.length)]

        const serverId = msg.key.server_id || msg.key.serverId

        if (!serverId) {
          return // Skip silently if no serverId
        }

        setTimeout(async () => {
          try {
            await sock.newsletterReactMessage(msg.key.remoteJid, serverId, randomEmoji)
            logger.info(`Channel reaction sent: ${randomEmoji} | server_id: ${serverId}`)
          } catch (err) {
            logger.error(`Channel auto-reaction failed: ${err.message}`)
          }
        }, 3000)
      }
      return
    }

    // --- CHANNEL INVITE ---
    if (!msg.key.fromMe && !invitedUsers.has(sender) && !sender.endsWith('@g.us')) {
      invitedUsers.add(sender)
      await sock.sendMessage(sender, { newsletterInvite: '0029Vb9HOWtFy72BOhfOqm0Q@newsletter', caption: '📢 Please follow our official channel for updates and support!' }).catch(() => {})
    }

    // --- ANTI-LINK & ANTI-DELETE ---
    cacheMessage(msg)
    const isLinkDeleted = await checkAntiLink(sock, msg)
    if (isLinkDeleted) return

    // --- AUTO REACT ---
    if (config.settings.autoReact && !msg.key.fromMe) {
      const emojis = ['👍', '❤️', '🔥', '😂', '😮']
      const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)]
      sock.sendMessage(msg.key.remoteJid, { react: { text: randomEmoji, key: msg.key } }).catch(() => {})
    }

    // --- COMMAND ROUTER ---
    if (!text.startsWith(config.prefix)) return
    if (msg.key.fromMe && !text.startsWith(config.prefix)) return

    const args = text.slice(config.prefix.length).trim().split(/\s+/)
    const commandName = args.shift().toLowerCase()
    if (!commandName) return

    const context = { sock, msg, commandName, args, text, sender, isGroup: msg.key.remoteJid.endsWith('@g.us'), startTime: Date.now() }
    await handleCommand(context)
    
  } catch (error) {
    logger.error('Error processing message: ' + error.message)
  }
}

module.exports = { processMessage }
