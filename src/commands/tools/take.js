'use strict'

const { downloadMediaMessage } = require('@whiskeysockets/baileys')

module.exports = {
  name: 'take',
  permission: 'public',
  execute: async ({ sock, msg, jid, args, config }) => {
    const quotedMsg = msg.message.extendedTextMessage?.contextInfo?.quotedMessage
    const isSticker = quotedMsg?.stickerMessage

    if (!isSticker) {
      return sock.sendMessage(jid, { text: 'Reply to a sticker to change its pack name.' })
    }

    const packName = args.length > 0 ? args.join(' ') : config.botName
    await sock.sendMessage(jid, { text: 'Rebranding sticker...' })

    try {
      const targetMsg = { key: msg.key, message: quotedMsg }
      const buffer = await downloadMediaMessage(targetMsg, 'buffer', {}, { logger: console })

      await sock.sendMessage(jid, { 
        sticker: buffer,
        // Baileys allows us to override the sticker metadata here
        // Note: Some WhatsApp versions ignore this, but Baileys attempts to inject the EXIF data
        packName: packName,
        author: config.ownerName
      })
    } catch (error) {
      throw new Error('Failed to process the sticker.')
    }
  }
}
