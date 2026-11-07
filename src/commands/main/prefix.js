'use strict'

const { updateSetting } = require('../../utils/database')

module.exports = {
  name: 'prefix',
  permission: 'owner',
  execute: async ({ sock, jid, args, config }) => {
    const newPrefix = args[0]

    if (!newPrefix) {
      return sock.sendMessage(jid, { 
        text: `📌 *Usᴀɢᴇ:* ${config.prefix}prefix <new_prefix>\n*Cᴜʀʀᴇɴᴛ:* ${config.prefix}` 
      })
    }

    // Validate: ensure it's short and doesn't contain spaces
    if (newPrefix.length > 3 || newPrefix.includes(' ')) {
      return sock.sendMessage(jid, { 
        text: 'Prefix must be a short string (1-3 characters) without spaces.' 
      })
    }

    // Update config and save to database
    config.prefix = newPrefix
    updateSetting('prefix', newPrefix)

    await sock.sendMessage(jid, { 
      text: `✅ Bot prefix changed to: *${newPrefix}*\nTry it out: ${newPrefix}ping` 
    })
  }
}
