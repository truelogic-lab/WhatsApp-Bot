'use strict'

const { updateSetting, loadDB, saveDB } = require('../../utils/database')

module.exports = {
  name: 'autoreply',
  permission: 'owner',
  execute: async ({ sock, jid, args, config }) => {
    const action = args[0]?.toLowerCase()
    
    if (action === 'on' || action === 'off') {
      const state = action === 'on'
      config.settings.autoReply = state
      updateSetting('autoReply', state)
      await sock.sendMessage(jid, { text: `Auto-Reply is now ${state ? 'ON' : 'OFF'}.` })
    } 
    else if (action === 'set') {
      const message = args.slice(1).join(' ')
      if (!message) return sock.sendMessage(jid, { text: 'Provide a message to set.' })
      
      const db = loadDB()
      db.autoReplyMessage = message
      saveDB(db)
      
      await sock.sendMessage(jid, { text: `✅ Auto-Reply message set to:\n\n"${message}"` })
    }
    else {
      const db = loadDB()
      const status = config.settings.autoReply ? 'ON' : 'OFF'
      const currentMsg = db.autoReplyMessage || 'I am currently away. I will reply soon.'
      
      await sock.sendMessage(jid, { 
        text: `📌 *Usᴀɢᴇ:*\n${config.prefix}autoreply on/off\n${config.prefix}autoreply set <message>\n\n*Cᴜʀʀᴇɴᴛ sᴛᴀᴛᴜs:* ${status}\n*Mᴇssᴀɢᴇ:* ${currentMsg}` 
      })
    }
  }
}
