'use strict'

const { loadDB, saveDB } = require('../../utils/database')

module.exports = {
  name: 'autoview',
  permission: 'owner',
  execute: async ({ sock, jid, args, config }) => {
    const action = args[0]?.toLowerCase()

    if (action === 'add') {
      const number = args[1]?.replace(/[^0-9]/g, '')
      if (!number) return sock.sendMessage(jid, { text: 'Provide a number to auto-view.' })

      const db = loadDB()
      if (!db.vipStatusContacts) db.vipStatusContacts = []
      
      if (!db.vipStatusContacts.includes(number)) {
        db.vipStatusContacts.push(number)
        saveDB(db)
      }
      
      await sock.sendMessage(jid, { text: `✅ Auto-View & Like enabled for +${number}` })
    }
    else if (action === 'remove') {
      const number = args[1]?.replace(/[^0-9]/g, '')
      const db = loadDB()
      if (db.vipStatusContacts) {
        db.vipStatusContacts = db.vipStatusContacts.filter(n => n !== number)
        saveDB(db)
      }
      await sock.sendMessage(jid, { text: `❌ Auto-View disabled for +${number}` })
    }
    else if (action === 'list') {
      const db = loadDB()
      if (!db.vipStatusContacts || db.vipStatusContacts.length === 0) {
        return sock.sendMessage(jid, { text: 'No VIP status contacts saved.' })
      }
      let text = '👑 *VIP Auto-View Contacts:*\n\n'
      db.vipStatusContacts.forEach(n => { text += `📱 +${n}\n` })
      await sock.sendMessage(jid, { text })
    }
    else {
      await sock.sendMessage(jid, { 
        text: `📌 *Usᴀɢᴇ:*\n${config.prefix}autoview add <number>\n${config.prefix}autoview remove <number>\n${config.prefix}autoview list` 
      })
    }
  }
}
