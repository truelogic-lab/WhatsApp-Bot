'use strict'

const { downloadMediaMessage } = require('@whiskeysockets/baileys')
const logger = require('../../utils/logger')

module.exports = {
  name: 'story',
  permission: 'owner',
  execute: async ({ sock, msg, jid, args, config }) => {
    const quotedMsg = msg.message.extendedTextMessage?.contextInfo?.quotedMessage
    const isMedia = quotedMsg?.imageMessage || quotedMsg?.videoMessage

    if (!isMedia) {
      return sock.sendMessage(jid, { text: `📌 *Usᴀɢᴇ:*\nReply to an image or video with ${config.prefix}story <caption>` })
    }

    await sock.sendMessage(jid, { react: { text: '⏳', key: msg.key } }).catch(() => {})

    try {
      // 1. Download the media
      const targetMsg = { key: msg.key, message: quotedMsg }
      const buffer = await downloadMediaMessage(targetMsg, 'buffer', {}, { logger: console })
      const caption = args.join(' ')

      // 2. Prepare payload
      const messagePayload = quotedMsg.imageMessage 
        ? { image: buffer, caption }
        : { video: buffer, caption }

      // 3. Post to Status Broadcast
      // Sending to 'status@broadcast' without statusJidList posts to all contacts/statuses
      await sock.sendMessage('status@broadcast', messagePayload)

      await sock.sendMessage(jid, { react: { text: '✅', key: msg.key } }).catch(() => {})
      await sock.sendMessage(jid, { 
        text: '✅ Successfully posted to your WhatsApp Status.' 
      })

    } catch (error) {
      logger.error(`Story command error: ${error.message}`)
      await sock.sendMessage(jid, { react: { text: '❌', key: msg.key } }).catch(() => {})
      throw new Error('Failed to post to status. The file might be too large or unsupported.')
    }
  }
}
