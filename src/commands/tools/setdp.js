'use strict'

const { downloadMediaMessage } = require('@whiskeysockets/baileys')

module.exports = {
  name: 'setdp',
  permission: 'owner',
  execute: async ({ sock, msg, jid }) => {
    const isImage = msg.message.imageMessage || msg.message.extendedTextMessage?.contextInfo?.quotedMessage?.imageMessage

    if (!isImage) {
      return sock.sendMessage(jid, { text: 'Reply to an image to set it as the bot profile picture.' })
    }

    await sock.sendMessage(jid, { react: { text: '⏳', key: msg.key } }).catch(() => {})

    try {
      const targetMsg = msg.message.imageMessage ? msg : { key: msg.key, message: msg.message.extendedTextMessage.contextInfo.quotedMessage }
      const buffer = await downloadMediaMessage(targetMsg, 'buffer', {}, { logger: console })
      
      await sock.updateProfilePicture(sock.user.id, buffer)
      await sock.sendMessage(jid, { text: '✅ Bot profile picture updated successfully.' })
      await sock.sendMessage(jid, { react: { text: '✅', key: msg.key } }).catch(() => {})
    } catch (error) {
      await sock.sendMessage(jid, { react: { text: '❌', key: msg.key } }).catch(() => {})
      throw new Error('Failed to update profile picture.')
    }
  }
}
