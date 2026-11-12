'use strict'

module.exports = {
  name: 'admin',
  permission: 'owner',
  aliases: ['broadcast', 'restart'],
  execute: async ({ sock, jid, args, commandName }) => {
    
    // 1. Broadcast
    if (commandName === 'broadcast') {
      const message = args.join(' ')
      if (!message) return sock.sendMessage(jid, { text: 'Provide a message to broadcast.' })

      await sock.sendMessage(jid, { text: 'Broadcasting to all chats...' })
      
      try {
        const chats = Object.keys(await sock.groupFetchAllParticipating())
        for (const chatId of chats) {
          await sock.sendMessage(chatId, { text: `*BROADCAST*\n\n${message}` })
          await new Promise(r => setTimeout(r, 2000)) 
        }
        await sock.sendMessage(jid, { text: 'Broadcast complete.' })
      } catch (error) {
        throw new Error('Broadcast failed.')
      }
    }

    // 2. Restart
    if (commandName === 'restart') {
      await sock.sendMessage(jid, { text: 'Restarting the engine...' })
      setTimeout(() => process.exit(0), 1000) 
    }
  }
}
