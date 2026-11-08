'use strict'

const { updateSetting } = require('../../utils/database')
const { getOwnerName } = require('../../utils/branding')

module.exports = {
  name: 'botname',
  permission: 'owner',
  execute: async ({ sock, jid, args, config }) => {
    const newName = args.join(' ')
    if (!newName) {
      return sock.sendMessage(jid, { text: `📌 *Usᴀɢᴇ:* ${config.prefix}botname <new_name>\n*Cᴜʀʀᴇɴᴛ:* ${config.botName}` })
    }

    try {
      await sock.updateProfileName(newName)
      config.botName = newName
      updateSetting('botName', newName)

      await sock.sendMessage(jid, { 
        text: `✅ Bot name changed to *${newName}* successfully!` 
      })
    } catch (error) {
      throw new Error('Failed to update bot name.')
    }
  }
}
