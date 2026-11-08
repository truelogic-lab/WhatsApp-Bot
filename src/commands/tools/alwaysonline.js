'use strict'

const { updateSetting } = require('../../utils/database')

module.exports = {
  name: 'alwaysonline',
  permission: 'owner',
  aliases: ['online'],
  execute: async ({ sock, jid, args, config }) => {
    const action = args[0]?.toLowerCase()

    if (action === 'on' || action === 'off') {
      const state = action === 'on'
      config.settings.alwaysOnline = state
      updateSetting('alwaysOnline', state)
      
      // Apply immediately
      if (state && sock.user) {
        await sock.sendPresenceUpdate('available')
      }

      await sock.sendMessage(jid, { 
        text: `✅ Always Online is now *${state ? 'ON' : 'OFF'}* and saved permanently.` 
      })
    } else {
      const status = config.settings.alwaysOnline ? 'ON' : 'OFF'
      await sock.sendMessage(jid, { 
        text: `📌 *Usᴀɢᴇ:* ${config.prefix}alwaysonline on/off\n*Cᴜʀʀᴇɴᴛ:* ${status}` 
      })
    }
  }
}
