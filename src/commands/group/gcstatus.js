'use strict'

const { downloadMediaMessage } = require('@whiskeysockets/baileys')
const logger = require('../../utils/logger')

module.exports = {
  name: 'gcstatus',
  permission: 'owner',
  execute: async ({ sock, msg, jid, args }) => {
    const contextInfo = msg.message.extendedTextMessage?.contextInfo
    const quotedMsg = contextInfo?.quotedMessage
    const isImage = quotedMsg?.imageMessage
    const isVideo = quotedMsg?.videoMessage

    if (!isImage && !isVideo) {
      return sock.sendMessage(jid, { 
        text: '📌 Reply to an image or video with this command to post it as a status.' 
      })
    }

    await sock.sendMessage(jid, { react: { text: '⏳', key: msg.key } }).catch(() => {})

    try {
      // FIX: Use quoted message's original JID and participant
      // The quoted message's remoteJid is always the chat where it was sent
      // The quoted participant is the original sender
      const quotedKey = {
        remoteJid: contextInfo.remoteJid || msg.key.remoteJid,
        fromMe: contextInfo.participant === sock.user.id, // true if bot sent the quoted msg
        id: contextInfo.stanzaId,
        participant: contextInfo.participant || msg.key.participant
      }

      const targetMsg = { key: quotedKey, message: quotedMsg }
      
      const buffer = await downloadMediaMessage(targetMsg, 'buffer', {}, { logger: console })
      const caption = args.join(' ') || ''

      // Fetch all groups the bot is in
      const groups = await sock.groupFetchAllParticipating()
      const groupJids = Object.keys(groups)

      if (groupJids.length === 0) {
        await sock.sendMessage(jid, { react: { text: '❌', key: msg.key } }).catch(() => {})
        return sock.sendMessage(jid, { text: '❌ The bot is not in any groups.' })
      }

      // Build message payload
      const messagePayload = isImage
        ? { image: buffer, caption }
        : { video: buffer, caption }

      // Post ONE account-level status visible to all group members
      await sock.sendMessage('status@broadcast', messagePayload, {
        statusJidList: groupJids
      })

      await sock.sendMessage(jid, { react: { text: '✅', key: msg.key } }).catch(() => {})
      await sock.sendMessage(jid, { 
        text: `✅ *Status Posted*\n\n📢 Your status is now live and visible to members of *${groupJids.length}* groups who have the bot saved as a contact.\n\n_Note: WhatsApp does not support per-group status rings via API — this is a single account-level status._` 
      })

    } catch (error) {
      logger.error(`gcstatus error: ${error.message}`)
      await sock.sendMessage(jid, { react: { text: '❌', key: msg.key } }).catch(() => {})
      throw new Error('Failed to post status. The file may be too large or unsupported.')
    }
  }
}
