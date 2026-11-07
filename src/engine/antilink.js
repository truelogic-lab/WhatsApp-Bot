'use strict'

const config = require('../../config')
const logger = require('../utils/logger')

async function checkAntiLink(sock, msg) {
  if (!config.settings.antiLink) return false
  
  const jid = msg.key.remoteJid
  if (!jid.endsWith('@g.us')) return false // Only for groups
  
  const text = msg.message.conversation || msg.message.extendedTextMessage?.text || ''
  
  // Regex to detect WhatsApp group links
  const linkRegex = /chat\.whatsapp\.com\/[a-zA-Z0-9]{20,}/i
  
  if (linkRegex.test(text)) {
    const sender = msg.key.participant || msg.key.remoteJid
    
    // Check if sender is an admin (to ignore admin links)
    try {
      const groupMetadata = await sock.groupMetadata(jid)
      const participant = groupMetadata.participants.find(p => p.id === sender)
      const isAdmin = participant && (participant.admin === 'admin' || participant.admin === 'superadmin')

      if (isAdmin) return false // Ignore if admin

      // 1. Delete the message
      await sock.sendMessage(jid, { delete: msg.key })
      
      // 2. Warn the user
      await sock.sendMessage(jid, { 
        text: `🚫 *Anti-Link*: @${sender.split('@')[0]}, group links are not allowed here.`,
        mentions: [sender]
      })
      logger.info(`Anti-Link triggered in ${jid} by ${sender}`)
      return true // Message was intercepted and deleted
      
    } catch (error) {
      logger.error(`Anti-Link failed: ${error.message}`)
    }
  }
  
  return false
}

module.exports = { checkAntiLink }
