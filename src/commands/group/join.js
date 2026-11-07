'use strict'

module.exports = {
  name: 'join',
  permission: 'owner',
  execute: async ({ sock, jid, args, config }) => {
    const link = args[0]

    if (!link || !link.includes('chat.whatsapp.com')) {
      return sock.sendMessage(jid, { 
        text: `📌 *Usᴀɢᴇ:* ${config.prefix}join <group_link>\nExample: ${config.prefix}join https://chat.whatsapp.com/XXXXXX` 
      })
    }

    // Extract the invite code from the URL
    const inviteCode = link.split('chat.whatsapp.com/')[1]
    
    if (!inviteCode) {
      return sock.sendMessage(jid, { text: 'Invalid group link format.' })
    }

    await sock.sendMessage(jid, { text: 'Attempting to join group...' })

    try {
      // Use Baileys to accept the invite
      await sock.groupAcceptInvite(inviteCode)
      await sock.sendMessage(jid, { text: '✅ Successfully joined the group!' })
    } catch (error) {
      throw new Error('Failed to join. The link may be invalid or the bot was previously removed from this group.')
    }
  }
}
