'use strict'

const { loadDB, saveDB } = require('../../utils/database')

module.exports = {
  name: 'birthday',
  permission: 'owner',
  execute: async ({ sock, jid, args, config }) => {
    const action = args[0]?.toLowerCase()

    if (action === 'set') {
      const number = args[1]?.replace(/[^0-9]/g, '')
      const date = args[2] // Format: DD/MM
      const message = args.slice(3).join(' ')

      if (!number || !date || !message) {
        return sock.sendMessage(jid, { 
          text: `📌 *Usᴀɢᴇ:* ${config.prefix}birthday set <number> <DD/MM> <message>\n*Example:* ${config.prefix}birthday set 254712345678 25/12 Happy Birthday! 🎉🎂` 
        })
      }

      // Validate Date Format (DD/MM)
      const dateRegex = /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])$/
      if (!dateRegex.test(date)) {
        return sock.sendMessage(jid, { text: '❌ Invalid date format. Please use DD/MM (e.g., 25/12 for Dec 25th).' })
      }

      const db = loadDB()
      if (!db.birthdays) db.birthdays = []
      
      // Prevent duplicates for the same number
      db.birthdays = db.birthdays.filter(b => b.number !== number)
      db.birthdays.push({ number, date, message })
      
      saveDB(db)

      await sock.sendMessage(jid, { 
        text: `✅ *Birthday Reminder Set!*\n\n📱 *Recipient:* +${number}\n📅 *Date:* ${date}\n💬 *Message:* ${message}` 
      })
    } 
    else if (action === 'list') {
      const db = loadDB()
      if (!db.birthdays || db.birthdays.length === 0) {
        return sock.sendMessage(jid, { text: 'No birthdays saved yet.' })
      }

      let text = '🎂 *Saved Birthdays:*\n\n'
      db.birthdays.forEach(b => { text += `📱 +${b.number} - ${b.date}\n` })
      await sock.sendMessage(jid, { text })
    }
    else if (action === 'remove') {
      const number = args[1]?.replace(/[^0-9]/g, '')
      if (!number) return sock.sendMessage(jid, { text: 'Provide a number to remove.' })

      const db = loadDB()
      if (db.birthdays) {
        db.birthdays = db.birthdays.filter(b => b.number !== number)
        saveDB(db)
      }
      await sock.sendMessage(jid, { text: `✅ Removed birthday for +${number}` })
    }
    else {
      await sock.sendMessage(jid, { 
        text: `📌 *Usᴀɢᴇ:*\n${config.prefix}birthday set <number> <DD/MM> <message>\n${config.prefix}birthday list\n${config.prefix}birthday remove <number>` 
      })
    }
  }
}
