'use strict'

const { updateSetting } = require('../../utils/database')

module.exports = {
  name: 'channelreact',
  permission: 'owner',
  execute: async ({ sock, jid, args, config }) => {
    const action = args[0]?.toLowerCase()

    if (action === 'on' || action === 'off') {
      const state = action === 'on'
      config.settings.autoChannelReact = state
      updateSetting('autoChannelReact', state) // Save to DB
      await sock.sendMessage(jid, { 
        text: `Channel Auto-React is now *${state ? 'ON' : 'OFF'}* and saved permanently.` 
      })
    } else {
      const status = config.settings.autoChannelReact ? 'ON' : 'OFF'
      await sock.sendMessage(jid, { 
        text: `📌 *Usᴀɢᴇ:* ${config.prefix}channelreact on/off\n*Cᴜʀʀᴇɴᴛ:* ${status}` 
      })
    }
  }
}
