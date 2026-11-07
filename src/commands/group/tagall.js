'use strict'

module.exports = {
  name: 'tagall',
  permission: 'admin',
  execute: async ({ sock, msg, args, jid, config }) => {
    const text = args.join(' ') || 'Attention everyone.'
    
    try {
      const groupMetadata = await sock.groupMetadata(jid)
      const participants = groupMetadata.participants.map(p => p.id)
      
      let tagText = `*Announcement:* ${text}\n\n`
      participants.forEach(p => {
        tagText += `@${p.split('@')[0]}\n`
      })
      
      await sock.sendMessage(jid, { 
        text: tagText, 
        mentions: participants 
      })
    } catch (error) {
      // The engine handles the error logging, but we throw it so the user gets the standard error message
      throw new Error('Failed to tag members.')
    }
  }
}
