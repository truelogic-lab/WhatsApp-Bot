'use strict'

const { loadDB, saveDB } = require('../../utils/database')

module.exports = {
  name: 'morning',
  permission: 'owner',
  execute: async ({ sock, jid, args, config }) => {
    const action = args[0]?.toLowerCase()

    if (action === 'set') {
      const number = args[1]?.replace(/[^0-9]/g, '')
      const time = args[2] // Expected format: HH:MM
      const message = args.slice(3).join(' ')

      if (!number || !time || !message) {
        return sock.sendMessage(jid, { 
          text: `📌 *Usᴀɢᴇ:* ${config.prefix}morning set <number> <HH:MM> <message>\n*Example:* ${config.prefix}morning set 254712345678 03:10 Good morning my love! ❤️` 
        })
      }

      // Validate time format
      const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
      if (!timeRegex.test(time)) {
        return sock.sendMessage(jid, { text: '❌ Invalid time format. Please use 24-hour format (HH:MM), e.g., 07:30 or 15:45.' })
      }

      const db = loadDB()
      db.morningConfig = { number, time, message }
      saveDB(db)

      await sock.sendMessage(jid, { 
        text: `✅ *Morning Message Configured!*\n\n📱 *Recipient:* +${number}\n💬 *Message:* ${message}\n⏰ *Time:* Every day at ${time}` 
      })
    } 
    else if (action === 'test') {
      const db = loadDB()
      if (!db.morningConfig) return sock.sendMessage(jid, { text: 'No morning message configured yet.' })
      
      await sock.sendMessage(`${db.morningConfig.number}@s.whatsapp.net`, { text: db.morningConfig.message })
      await sock.sendMessage(jid, { text: '✅ Test message sent successfully.' })
    }
    else if (action === 'off') {
      const db = loadDB()
      delete db.morningConfig
      saveDB(db)
      await sock.sendMessage(jid, { text: '❌ Morning message system has been disabled.' })
    }
    else {
      const db = loadDB()
      if (db.morningConfig) {
        await sock.sendMessage(jid, { 
          text: `📌 *Cᴜʀʀᴇɴᴛ Cᴏɴғɪɢ:*\n📱 Number: +${db.morningConfig.number}\n⏰ Time: ${db.morningConfig.time}\n💬 Message: ${db.morningConfig.message}` 
        })
      } else {
        await sock.sendMessage(jid, { 
          text: `📌 *Usᴀɢᴇ:*\n${config.prefix}morning set <number> <HH:MM> <message>\n${config.prefix}morning test\n${config.prefix}morning off` 
        })
      }
    }
  }
}
