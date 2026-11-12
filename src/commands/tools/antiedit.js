'use strict'

const { updateSetting } = require('../../utils/database')

module.exports = {
  name: 'antiedit',
  permission: 'owner',
  execute: async ({ sock, jid, args, config }) => {
    const action = args[0]?.toLowerCase()

    if (action === 'on' || action === 'off') {
      const state = action === 'on'
      config.settings.antiEdit = state
      updateSetting('antiEdit', state)
      await sock.sendMessage(jid, { text: `✅ Anti-Edit is now *${state ? 'ON' : 'OFF'}*` })
    } else {
      const status = config.settings.antiEdit ? 'ON' : 'OFF'
      await sock.sendMessage(jid, { 
        text: `📌 *Usᴀɢᴇ:* ${config.prefix}antiedit on/off\n*Cᴜʀʀᴇɴᴛ:* ${status}` 
      })
    }
  }
}
