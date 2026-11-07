'use strict'

const { downloadMediaMessage } = require('@whiskeysockets/baileys')
const sharp = require('sharp')
const logger = require('../../utils/logger')

module.exports = {
  name: 'sticker',
  permission: 'public',
  execute: async ({ sock, msg, jid }) => {
    // Check if the message itself is an image/video, OR if it's a reply to one
    const isImage = msg.message.imageMessage || msg.message.extendedTextMessage?.contextInfo?.quotedMessage?.imageMessage
    const isVideo = msg.message.videoMessage || msg.message.extendedTextMessage?.contextInfo?.quotedMessage?.videoMessage

    if (!isImage && !isVideo) {
      return sock.sendMessage(jid, { text: 'Reply to an image or video with this command to create a sticker.' })
    }


    try {
      // Determine the target message object
      const targetMsg = msg.message.imageMessage || msg.message.videoMessage 
        ? msg 
        : { key: msg.key, message: msg.message.extendedTextMessage.contextInfo.quotedMessage }

      // Download media buffer
      const buffer = await downloadMediaMessage(targetMsg, 'buffer', {}, { logger: console })

      // Convert to WebP sticker (512x512)
      // Note: Full video-to-sticker requires ffmpeg, we will handle static images first for stability
      let stickerBuffer
      if (isImage) {
        stickerBuffer = await sharp(buffer)
          .resize(512, 512, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
          .webp()
          .toBuffer()
      } else {
        throw new Error('Video stickers require FFmpeg integration, which is not yet configured.')
      }

      await sock.sendMessage(jid, { sticker: stickerBuffer })
    } catch (error) {
      logger.error(`Sticker error: ${error.message}`)
      await sock.sendMessage(jid, { text: 'Failed to create sticker. Ensure it is a valid image.' })
    }
  }
}
