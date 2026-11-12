'use strict'

const config = require('../../config')
const logger = require('../utils/logger')
const { downloadMediaMessage } = require('@whiskeysockets/baileys')
const { getOwnerNumber } = require('../handlers/permissions')

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
    const isRevoked = update.update?.messageStubType === 1 || 
                      update.update?.message?.protocolMessage?.type === 0
    
    if (isRevoked) {
      const msgId = update.key.id
      const cachedMsg = messageCache.get(msgId)
      
      if (cachedMsg) {
        const chatJid = update.key.remoteJid
        const sender = cachedMsg.key.participant || cachedMsg.key.remoteJid
        
        const ownerJid = sock.user?.id ? sock.user.id.split(':')[0] + '@s.whatsapp.net' : `${getOwnerNumber()}@s.whatsapp.net`
        
        try {
          let chatContext = ''
          if (chatJid.endsWith('@g.us')) {
            try {
              const metadata = await sock.groupMetadata(chatJid)
              chatContext = metadata.subject
            } catch (e) {
              chatContext = 'Unknown Group'
            }
          } else {
            chatContext = 'Direct Message'
          }

          // Get saved contact name
          let senderName = cachedMsg.pushName 
          if (sock.store && sock.store.contacts && sock.store.contacts[sender]) {
            const contact = sock.store.contacts[sender]
            senderName = contact.name || contact.notify || contact.verifiedName || cachedMsg.pushName
          } else if (sock.store && sock.store.contacts && sock.store.contacts[sender.split('@')[0] + '@s.whatsapp.net']) {
            const contact = sock.store.contacts[sender.split('@')[0] + '@s.whatsapp.net']
            senderName = contact.name || contact.notify || contact.verifiedName || cachedMsg.pushName
          }

          if (!senderName || senderName === '') {
            senderName = sender.includes('@lid') ? 'Linked ID User' : `+${sender.split('@')[0]}`
          }

          const text = cachedMsg.message.conversation || 
                       cachedMsg.message.extendedTextMessage?.text
                       
          // --- DECORATED MESSAGE TEMPLATE ---
          const header = `╭━━━━━━〔 ⚠️ ᴀɴᴛɪ-ᴅᴇʟᴇᴛᴇ 〕━━━━━━
│ ◉ ᴄᴏɴᴛᴇxᴛ: ${chatContext}
│ ◉ sᴇɴᴅᴇʀ: ${senderName}
╰━━━━━━━━━━━━━━━━━━━━━━━`

          if (text) {
            const finalMessage = `${header}\n\n📝 *Deleted Message:*\n> ${text}`
            await sock.sendMessage(ownerJid, { text: finalMessage })
          } 
          else if (
            cachedMsg.message.imageMessage || 
            cachedMsg.message.videoMessage || 
            cachedMsg.message.audioMessage ||
            cachedMsg.message.stickerMessage
          ) {
            const buffer = await downloadMediaMessage(cachedMsg, 'buffer', {}, { logger: console })
            
            const finalCaption = `${header}\n\n📝 *Deleted Media Detected*`

            if (cachedMsg.message.imageMessage) {
              await sock.sendMessage(ownerJid, { image: buffer, caption: finalCaption })
            } else if (cachedMsg.message.videoMessage) {
              await sock.sendMessage(ownerJid, { video: buffer, caption: finalCaption })
            } else if (cachedMsg.message.audioMessage) {
              await sock.sendMessage(ownerJid, { audio: buffer, mimetype: 'audio/mp4' })
              await sock.sendMessage(ownerJid, { text: finalCaption })
            } else if (cachedMsg.message.stickerMessage) {
              await sock.sendMessage(ownerJid, { sticker: buffer })
              await sock.sendMessage(ownerJid, { text: finalCaption })
            }
          }
          
          logger.info(`Anti-Delete alert forwarded to owner inbox.`)
        } catch (err) {
          logger.error(`Anti-Delete failed to forward: ${err.message}`)
        }
      }
    }
  }
}

module.exports = { cacheMessage, handleMessageUpdate, messageCache }
