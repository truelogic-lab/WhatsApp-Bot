'use strict'

const { downloadMediaMessage } = require('@whiskeysockets/baileys')

module.exports = {
  name: 'autopost',
  permission: 'owner',
  execute: async ({ sock, msg, args, jid }) => {
    const text = args.join(' ')
    const quotedMsg = msg.message.extendedTextMessage?.contextInfo?.quotedMessage
    const isMedia = quotedMsg?.imageMessage || quotedMsg?.videoMessage

    // 1. If replying to media
    if (isMedia) {
      await sock.sendMessage(jid, { react: { text: '⏳', key: msg.key } }).catch(() => {})
      
      try {
        const targetMsg = { key: msg.key, message: quotedMsg }
        const buffer = await downloadMediaMessage(targetMsg, 'buffer', {}, { logger: console })
        
        if (quotedMsg.imageMessage) {
          await sock.sendMessage('status@broadcast', { 
            image: buffer, 
            caption: text || '' 
          })
        } else if (quotedMsg.videoMessage) {
          await sock.sendMessage('status@broadcast', { 
            video: buffer, 
            caption: text || '' 
          })
        }
        
        await sock.sendMessage(jid, { react: { text: '✅', key: msg.key } }).catch(() => {})
      } catch (error) {
        await sock.sendMessage(jid, { react: { text: '❌', key: msg.key } }).catch(() => {})
        throw new Error('Failed to post media to status.')
      }
      return
    }

    // 2. If typing text
    if (text) {
      await sock.sendMessage(jid, { react: { text: '⏳', key: msg.key } }).catch(() => {})
      
      try {
        // Generate a background color based on text length or random
        const bgColors = ['#075E54', '#128C7E', '#25D366', '#34B7F1', '#ECE5DD', '#000000']
        const randomColor = bgColors[Math.floor(Math.random() * bgColors.length)]

        await sock.sendMessage('status@broadcast', { 
          text: text,
          backgroundColor: randomColor,
          font: 2 // 2 is usually a nice font, 0-5 available
        })
        
        await sock.sendMessage(jid, { react: { text: '✅', key: msg.key } }).catch(() => {})
      } catch (error) {
        await sock.sendMessage(jid, { react: { text: '❌', key: msg.key } }).catch(() => {})
        throw new Error('Failed to post text to status.')
      }
      return
    }

    // 3. Usage
    await sock.sendMessage(jid, { 
      text: `📌 *Usᴀɢᴇ:*\n1. ${config.prefix}autopost <text> (Posts text status)\n2. Reply to an image/video with ${config.prefix}autopost (Posts media status)` 
    })
  }
}
