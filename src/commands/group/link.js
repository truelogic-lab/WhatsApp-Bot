'use strict'

module.exports = {
  name: 'link',
  permission: 'admin',
  execute: async ({ sock, msg, jid }) => {
    // Ensure this is being run in a group
    if (!jid.endsWith('@g.us')) {
      return sock.sendMessage(jid, { text: 'This command can only be used inside a group.' })
    }

    try {
      // Fetch the group invite code
      const code = await sock.groupInviteCode(jid)
      
      await sock.sendMessage(jid, { 
        text: `🔗 *Group Invite Link:*\nhttps://chat.whatsapp.com/${code}` 
      })
    } catch (error) {
      throw new Error('Failed to get the group link. Ensure the bot is an admin in this group.')
    }
  }
}
