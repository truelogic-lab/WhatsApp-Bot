'use strict'

const { updateSetting } = require('../../utils/database')

module.exports = {
  name: 'autoread',
  permission: 'owner',
  aliases: ['recording'],
  execute: async ({ sock, jid, args, config, commandName }) => {
    const action = args[0]?.toLowerCase()

    if (action === 'on' || action === 'off') {
      const state = action === 'on'
      
      if (commandName === 'autoread') {
        config.settings.autoRead = state
        updateSetting('autoRead', state)
        await sock.sendMessage(jid, { text: `✅ Auto-Read is now *${state ? 'ON' : 'OFF'}*` })
      } 
      else if (commandName === 'recording') {
        config.settings.recording = state
        updateSetting('recording', state)
        
        // Apply immediately
        if (state) {
          await sock.sendPresenceUpdate('recording', jid).catch(() => {})
        }
        
        await sock.sendMessage(jid, { text: `✅ Recording Presence is now *${state ? 'ON' : 'OFF'}*` })
      }
    } else {
      const status = commandName === 'autoread' ? (config.settings.autoRead ? 'ON' : 'OFF') : (config.settings.recording ? 'ON' : 'OFF')
      await sock.sendMessage(jid, { 
        text: `📌 *Usᴀɢᴇ:* ${config.prefix}${commandName} on/off\n*Cᴜʀʀᴇɴᴛ:* ${status}` 
      })
    }
  }
}
