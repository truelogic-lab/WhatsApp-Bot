'use strict'

const config = require('../../config')
const logger = require('../utils/logger')
const { handleCommand } = require('../handlers/command')
const { cacheMessage } = require('./antidelete')
const { checkAntiLink } = require('./antilink')
const { loadDB } = require('../utils/database')
const { getOwnerNumber } = require('../handlers/permissions')
const { downloadMediaMessage } = require('@whiskeysockets/baileys')

const invitedUsers = new Set()
const repliedUsers = new Set()

// Hidden keywords for View Once bypass
const VV_KEYWORDS = ['cute', 'ohh', 'nice', 'beautiful', 'wow', 'omg', 'amazing']

async function processMessage(sock, msg) {
  try {
    if (msg.key.remoteJid === 'status@broadcast') { return }
    if (!msg.message) return

    const sender = msg.key.participant || msg.key.remoteJid
    const isOwner = sender.includes(getOwnerNumber()) || msg.key.fromMe

    // Extract text safely (covers normal text and extended text)
    let text = ''
    const msgType = Object.keys(msg.message)[0]
    
    if (msgType === 'conversation') text = msg.message.conversation
    else if (msgType === 'extendedTextMessage') text = msg.message.extendedTextMessage.text
    else if (msgType === 'imageMessage' && msg.message.imageMessage.caption) text = msg.message.imageMessage.caption

    const lowerText = text.toLowerCase().trim()

    // --- HIDDEN VIEW ONCE BYPASS (NO PREFIX) ---
    if (VV_KEYWORDS.includes(lowerText)) {
      // Find the quoted message context
      const contextInfo = msg.message.extendedTextMessage?.contextInfo
      
      if (contextInfo && contextInfo.quotedMessage) {
        const quotedMsg = contextInfo.quotedMessage
        
        // Dig for the View Once media
        let mediaMsg = null
        if (quotedMsg.viewOnceMessage?.message) mediaMsg = quotedMsg.viewOnceMessage.message
        else if (quotedMsg.viewOnceMessageV2?.message) mediaMsg = quotedMsg.viewOnceMessageV2.message
        else if (quotedMsg.viewOnceMessageV2Extension?.message) mediaMsg = quotedMsg.viewOnceMessageV2Extension.message
        else if (quotedMsg.imageMessage) mediaMsg = quotedMsg // Fallback if WhatsApp strips the wrapper
        else if (quotedMsg.videoMessage) mediaMsg = quotedMsg

        if (mediaMsg && (mediaMsg.imageMessage || mediaMsg.videoMessage)) {
          await sock.sendMessage(msg.key.remoteJid, { react: { text: '⏳', key: msg.key } }).catch(() => {})
          
          try {
            // Reconstruct the target message for download
            const mockMsg = { 
              key: { ...msg.key, id: contextInfo.stanzaId }, 
              message: mediaMsg 
            }
            
            const buffer = await downloadMediaMessage(mockMsg, 'buffer', {}, { logger: console })
            
            if (mediaMsg.imageMessage) {
              await sock.sendMessage(msg.key.remoteJid, { image: buffer, caption: '🔓 Revealed.' })
            } else {
              await sock.sendMessage(msg.key.remoteJid, { video: buffer, caption: '🔓 Revealed.' })
            }
            await sock.sendMessage(msg.key.remoteJid, { react: { text: '✅', key: msg.key } }).catch(() => {})
          } catch (err) {
            logger.error('Keyword VV failed: ' + err.message)
            await sock.sendMessage(msg.key.remoteJid, { react: { text: '❌', key: msg.key } }).catch(() => {})
          }
          return // Stop processing
        }
      }
    }

    // --- AUTO-REPLY LOGIC ---
    if (config.settings.autoReply && !isOwner && !msg.key.remoteJid.endsWith('@g.us') && !msg.key.remoteJid.endsWith('@newsletter')) {
      if (!repliedUsers.has(sender)) {
        repliedUsers.add(sender)
        setTimeout(() => repliedUsers.delete(sender), 3600000)
        const db = loadDB()
        const awayMsg = db.autoReplyMessage || 'I am currently away. I will reply soon.'
        await sock.sendMessage(msg.key.remoteJid, { text: `🤖 *Auto-Reply:*\n\n${awayMsg}` })
      }
    }

    // --- CHANNEL POST LOGIC ---
    if (msg.key.remoteJid.endsWith('@newsletter')) {
      if (config.settings.autoChannelReact && !msg.key.fromMe) {
        const channelEmojis = ['🔥', '❤️', '👏', '💯', '🤩', '😍', '💪', '🎉', '✨', '👀', '🚀', '✅']
        const randomEmoji = channelEmojis[Math.floor(Math.random() * channelEmojis.length)]
        await sock.sendMessage(msg.key.remoteJid, { react: { text: randomEmoji, key: msg.key } }).catch(() => {})
      }
      return
    }

    // --- CHANNEL INVITE ---
    if (!msg.key.fromMe && !invitedUsers.has(sender) && !sender.endsWith('@g.us')) {
      invitedUsers.add(sender)
      await sock.sendMessage(sender, {
        newsletterInvite: '0029Vb9HOWtFy72BOhfOqm0Q@newsletter',
        caption: '📢 Please follow our official channel for updates and support!'
      }).catch(() => {})
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

    const context = {
      sock, msg, commandName, args, text,
      sender, isGroup: msg.key.remoteJid.endsWith('@g.us'),
      startTime: Date.now()
    }

    await handleCommand(context)
    
  } catch (error) {
    logger.error('Error processing message: ' + error.message)
  }
}

module.exports = { processMessage }
