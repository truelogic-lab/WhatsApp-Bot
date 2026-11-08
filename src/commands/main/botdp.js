'use strict'

const { downloadMediaMessage } = require('@whiskeysockets/baileys')

module.exports = {
  name: 'botdp',
  permission: 'owner',
  execute: async ({ sock, msg, jid, config }) => {
    const quotedMsg = msg.message.extendedTextMessage?.contextInfo?.quotedMessage
    const isImage = quotedMsg?.imageMessage

    if (!isImage) {
      return sock.sendMessage(jid, { text: `📌 Reply to an image with ${config.prefix}botdp to set it as the bot's profile picture.` })
    }

    try {
      const targetMsg = { key: msg.key, message: quotedMsg }
      const buffer = await downloadMediaMessage(targetMsg, 'buffer', {}, { logger: console })
      
      await sock.updateProfilePicture(sock.user.id, buffer)
      await sock.sendMessage(jid, { text: '✅ Bot profile picture updated successfully!' })
    } catch (error) {
      throw new Error('Failed to update bot profile picture.')
    }
  }
}
