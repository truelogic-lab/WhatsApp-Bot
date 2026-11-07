'use strict'

const { updateSetting } = require('../../utils/database')

module.exports = {
  name: 'antidelete',
  permission: 'owner',
  aliases: ['antilink'],
  execute: async ({ sock, jid, args, config, commandName }) => {
    const action = args[0]?.toLowerCase()
    const key = commandName === 'antidelete' ? 'antiDelete' : 'antiLink'

    if (action === 'on' || action === 'off') {
      const state = action === 'on'
      config.settings[key] = state
      updateSetting(key, state)
      await sock.sendMessage(jid, { text: `${commandName.toUpperCase()} is now ${state ? 'ON' : 'OFF'} and saved permanently.` })
    } else {
      const status = config.settings[key] ? 'ON' : 'OFF'
      await sock.sendMessage(jid, { 
        text: `📌 *Usᴀɢᴇ:* ${config.prefix}${commandName} on/off\n*Cᴜʀʀᴇɴᴛ:* ${status}` 
      })
    }
  }
}
