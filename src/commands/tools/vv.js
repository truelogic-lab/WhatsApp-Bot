'use strict'

const { downloadMediaMessage } = require('@whiskeysockets/baileys')
const logger = require('../../utils/logger')

module.exports = {
  name: 'vv',
  permission: 'public',
  execute: async ({ sock, msg, jid }) => {
    const quotedMsg = msg.message.extendedTextMessage?.contextInfo?.quotedMessage

    if (!quotedMsg) {
      return sock.sendMessage(jid, { text: 'Reply to a View Once image or video with this command.' })
    }

    // Deep search for the media object (handles all WhatsApp version wrappers)
    let mediaMsg = null
    
    if (quotedMsg.viewOnceMessage?.message) {
      mediaMsg = quotedMsg.viewOnceMessage.message
    } else if (quotedMsg.viewOnceMessageV2?.message) {
      mediaMsg = quotedMsg.viewOnceMessageV2.message
    } else if (quotedMsg.viewOnceMessageV2Extension?.message) {
      mediaMsg = quotedMsg.viewOnceMessageV2Extension.message
    } else if (quotedMsg.imageMessage || quotedMsg.videoMessage) {
      // Fallback for weird edge cases
      mediaMsg = quotedMsg
    }

    if (!mediaMsg || (!mediaMsg.imageMessage && !mediaMsg.videoMessage)) {
      return sock.sendMessage(jid, { 
        text: 'The replied message is not a View Once media. Note: If you already opened it on your phone, it is permanently gone.' 
      })
    }


    try {
      // Reconstruct the message for Baileys to download
      const mockMsg = {
        key: {
          remoteJid: jid,
          id: msg.key.id,
          participant: msg.key.participant || jid
        },
        message: mediaMsg
      }

      const buffer = await downloadMediaMessage(mockMsg, 'buffer', {}, { logger: console })
      
      const caption = mediaMsg.imageMessage?.caption || mediaMsg.videoMessage?.caption || 'Revealed View Once Media'

      if (mediaMsg.imageMessage) {
        await sock.sendMessage(jid, { image: buffer, caption: `🔓 ${caption}` })
      } else if (mediaMsg.videoMessage) {
        await sock.sendMessage(jid, { video: buffer, caption: `🔓 ${caption}` })
      }

    } catch (error) {
      logger.error(`VV Error: ${error.message}`)
      throw new Error('Failed to reveal media. It was likely opened on another device before the bot could grab it.')
    }
  }
}
