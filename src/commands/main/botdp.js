'use strict'

const { downloadMediaMessage } = require('@whiskeysockets/baileys')
const fs = require('fs')
const path = require('path')

module.exports = {
  name: 'botdp',
  permission: 'owner',
  aliases: ['menudp'],
  execute: async ({ sock, msg, jid, config }) => {
    const quotedMsg = msg.message.extendedTextMessage?.contextInfo?.quotedMessage
    const isImage = quotedMsg?.imageMessage

    if (!isImage) {
      return sock.sendMessage(jid, { text: `📌 Reply to an image with ${config.prefix}botdp to set it as the Menu Hero Image.` })
    }

    await sock.sendMessage(jid, { react: { text: '⏳', key: msg.key } }).catch(() => {})

    try {
      const targetMsg = { key: msg.key, message: quotedMsg }
      const buffer = await downloadMediaMessage(targetMsg, 'buffer', {}, { logger: console })
      
      // Save the image to assets/menu.png
      const imagePath = path.join(__dirname, '../../../assets/menu.png')
      fs.writeFileSync(imagePath, buffer)
      
      await sock.sendMessage(jid, { 
        text: '✅ Menu Hero Image updated successfully!\nType `.menu` to see the new image.' 
      })
      await sock.sendMessage(jid, { react: { text: '✅', key: msg.key } }).catch(() => {})

    } catch (error) {
      await sock.sendMessage(jid, { react: { text: '❌', key: msg.key } }).catch(() => {})
      throw new Error('Failed to update menu image.')
    }
  }
}
