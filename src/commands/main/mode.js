'use strict'

const { updateSetting } = require('../../utils/database')

module.exports = {
  name: 'mode',
  permission: 'owner',
  execute: async ({ sock, jid, args, config }) => {
    const action = args[0]?.toLowerCase()

    if (['public', 'private', 'inbox'].includes(action)) {
      config.settings.mode = action
      updateSetting('mode', action) // Save to DB
      await sock.sendMessage(jid, { 
        text: `✅ Bot mode changed to *${action.toUpperCase()}* and saved permanently.` 
      })
    } else {
      await sock.sendMessage(jid, { 
        text: `📌 *Usᴀɢᴇ:* ${config.prefix}mode public/private/inbox\n*Cᴜʀʀᴇɴᴛ:* ${config.settings.mode}` 
      })
    }
  }
}
