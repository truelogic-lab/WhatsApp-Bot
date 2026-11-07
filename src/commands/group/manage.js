'use strict'

module.exports = {
  name: 'groupmanage',
  permission: 'admin',
  aliases: ['mute', 'unmute', 'link'],
  execute: async ({ sock, msg, jid, commandName }) => {
    // Note: commandName will be 'mute', 'unmute', or 'link' based on what the user typed
    try {
      if (commandName === 'mute') {
        await sock.groupSettingUpdate(jid, 'announcement')
        await sock.sendMessage(jid, { text: 'Group has been muted. Only admins can send messages.' })
      } 
      else if (commandName === 'unmute') {
        await sock.groupSettingUpdate(jid, 'not_announcement')
        await sock.sendMessage(jid, { text: 'Group has been unmuted. Everyone can send messages.' })
      } 
      else if (commandName === 'link') {
        const code = await sock.groupInviteCode(jid)
        await sock.sendMessage(jid, { text: `Group Invite Link:\nhttps://chat.whatsapp.com/${code}` })
      }
    } catch (error) {
      throw new Error('Failed to execute group action. Ensure the bot is an admin.')
    }
  }
}
