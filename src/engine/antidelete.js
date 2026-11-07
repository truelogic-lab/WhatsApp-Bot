'use strict'

const config = require('../../config')
const logger = require('../utils/logger')
const { downloadMediaMessage } = require('@whiskeysockets/baileys')

// In-memory cache (keeps last 150 messages to prevent memory leaks)
const messageCache = new Map()

function cacheMessage(msg) {
  if (!msg.message || msg.key.remoteJid === 'status@broadcast') return
  
  if (messageCache.size > 150) {
    const firstKey = messageCache.keys().next().value
    messageCache.delete(firstKey)
  }

  messageCache.set(msg.key.id, msg)
}

async function handleMessageUpdate(sock, updates) {
  if (!config.settings.antiDelete) return

  for (const update of updates) {
    // WhatsApp uses two methods to indicate a deleted message
    const isRevoked = update.update?.messageStubType === 1 || 
                      update.update?.message?.protocolMessage?.type === 0
    
    if (isRevoked) {
      const msgId = update.key.id
      const cachedMsg = messageCache.get(msgId)
      
      if (cachedMsg) {
        const jid = update.key.remoteJid
        const sender = cachedMsg.key.participant || cachedMsg.key.remoteJid
        
        try {
          // Check if it's text
          const text = cachedMsg.message.conversation || 
                       cachedMsg.message.extendedTextMessage?.text
                       
          if (text) {
            await sock.sendMessage(jid, { 
              text: `⚠️ *Anti-Delete Alert*\n\n👤 *Sender:* @${sender.split('@')[0]}\n📝 *Message:* ${text}`,
              mentions: [sender]
            })
          } 
          // Check if it's media (Image/Video)
          else if (cachedMsg.message.imageMessage || cachedMsg.message.videoMessage) {
            const type = cachedMsg.message.imageMessage ? 'image' : 'video'
            const buffer = await downloadMediaMessage(cachedMsg, 'buffer', {}, { logger: console })
            
            await sock.sendMessage(jid, { 
              [type]: buffer,
              caption: `⚠️ *Anti-Delete Alert*\n\n👤 *Sender:* @${sender.split('@')[0]}\n📝 *Deleted Media*`,
              mentions: [sender]
            })
          }
          
          logger.info(`Anti-Delete triggered in ${jid} for message from ${sender}`)
        } catch (err) {
          logger.error(`Anti-Delete failed to recover media: ${err.message}`)
        }
      }
    }
  }
}

module.exports = { cacheMessage, handleMessageUpdate }
