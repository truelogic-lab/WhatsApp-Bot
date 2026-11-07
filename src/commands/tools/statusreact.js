'use strict'

const { updateSetting } = require('../../utils/database')

module.exports = {
  name: 'statusreact',
  permission: 'owner',
  execute: async ({ sock, jid, args, config }) => {
    const action = args[0]?.toLowerCase()

    if (action === 'on' || action === 'off') {
      const state = action === 'on'
      config.settings.statusReact = state
      updateSetting('statusReact', state) // Save to DB
      await sock.sendMessage(jid, { text: `Status Auto-React is now ${state ? 'ON' : 'OFF'} and saved permanently.` })
    } else {
      const status = config.settings.statusReact ? 'ON' : 'OFF'
      await sock.sendMessage(jid, { 
        text: `📌 *Usᴀɢᴇ:* ${config.prefix}statusreact on/off\n*Cᴜʀʀᴇɴᴛ:* ${status}` 
      })
    }
  }
}
