'use strict'

module.exports = {
  name: 'description',
  permission: 'owner',
  execute: async ({ sock, jid, args, config }) => {
    const newDesc = args.join(' ')
    if (!newDesc) {
      return sock.sendMessage(jid, { text: `📌 *Usᴀɢᴇ:* ${config.prefix}description <new_description>` })
    }

    try {
      await sock.updateProfileStatus(newDesc)
      await sock.sendMessage(jid, { 
        text: `✅ Bot description updated successfully!` 
      })
    } catch (error) {
      throw new Error('Failed to update description.')
    }
  }
}
