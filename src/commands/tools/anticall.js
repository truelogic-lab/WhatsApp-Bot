'use strict'

const { updateSetting } = require('../../utils/database')

module.exports = {
  name: 'anticall',
  permission: 'owner',
  execute: async ({ sock, jid, args, config }) => {
    const action = args[0]?.toLowerCase()

    if (action === 'on' || action === 'off') {
      const state = action === 'on'
      config.settings.antiCall = state
      updateSetting('antiCall', state) // Save to DB
      await sock.sendMessage(jid, { 
        text: `Anti-Call is now *${state ? 'ON' : 'OFF'}* and saved permanently.` 
      })
    } else {
      const status = config.settings.antiCall ? 'ON' : 'OFF'
      await sock.sendMessage(jid, { 
        text: `📌 *Usᴀɢᴇ:* ${config.prefix}anticall on/off\n*Cᴜʀʀᴇɴᴛ:* ${status}` 
      })
    }
  }
}
