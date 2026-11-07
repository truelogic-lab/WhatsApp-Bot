'use strict'

module.exports = {
  name: 'promote',
  permission: 'admin',
  execute: async ({ sock, msg, jid }) => {
    const quotedParticipant = msg.message.extendedTextMessage?.contextInfo?.participant
    
    if (!quotedParticipant) {
      return sock.sendMessage(jid, { 
        text: 'Reply to the message of the user you want to promote.' 
      })
    }

    try {
      await sock.groupParticipantsUpdate(jid, [quotedParticipant], 'promote')
      await sock.sendMessage(jid, { text: 'User promoted to admin successfully.' })
    } catch (error) {
      throw new Error('Failed to promote user. Ensure the bot has admin privileges.')
    }
  }
}
