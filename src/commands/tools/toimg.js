'use strict'

const { downloadMediaMessage } = require('@whiskeysockets/baileys')
const sharp = require('sharp')

module.exports = {
  name: 'toimg',
  permission: 'public',
  execute: async ({ sock, msg, jid }) => {
    const quotedMsg = msg.message.extendedTextMessage?.contextInfo?.quotedMessage
    const isSticker = quotedMsg?.stickerMessage

    if (!isSticker) {
      return sock.sendMessage(jid, { text: 'Reply to a sticker to convert it to an image.' })
    }

    await sock.sendMessage(jid, { text: 'Converting to image...' })

    try {
      const targetMsg = { key: msg.key, message: quotedMsg }
      const buffer = await downloadMediaMessage(targetMsg, 'buffer', {}, { logger: console })

      // Convert WebP sticker to PNG image
      const pngBuffer = await sharp(buffer)
        .png()
        .toBuffer()

      await sock.sendMessage(jid, { 
        image: pngBuffer,
        caption: 'Converted from sticker.'
      })
    } catch (error) {
      throw new Error('Failed to convert sticker. It might be an animated sticker (not supported yet).')
    }
  }
}
