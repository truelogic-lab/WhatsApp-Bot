'use strict'

module.exports = {
  name: 'kick',
  permission: 'admin',
  execute: async ({ sock, msg, jid }) => {
    // 1. Check if the user replied to someone
    const quotedParticipant = msg.message.extendedTextMessage?.contextInfo?.participant
    
    if (!quotedParticipant) {
      return sock.sendMessage(jid, { 
        text: 'Reply to the message of the user you want to remove.' 
      })
    }

    // 2. Prevent kicking the bot itself or the owner
    if (quotedParticipant === sock.user.id) {
      return sock.sendMessage(jid, { text: 'I cannot remove myself from the group.' })
    }

    try {
      // 3. Execute the kick
      await sock.groupParticipantsUpdate(jid, [quotedParticipant], 'remove')
      await sock.sendMessage(jid, { text: 'User removed successfully.' })
    } catch (error) {
      // If the bot isn't an admin, Baileys throws an error here
      throw new Error('Failed to remove user. Ensure the bot has admin privileges.')
    }
  }
}
