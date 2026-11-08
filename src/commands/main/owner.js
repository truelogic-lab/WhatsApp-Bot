'use strict'

const { getOwnerNumber } = require('../../handlers/permissions')

module.exports = {
  name: 'owner',
  permission: 'owner',
  aliases: ['broadcast', 'restart', 'owner'],
  execute: async ({ sock, jid, args, config, commandName }) => {

    if (commandName === 'owner') {
      const ownerNumber = getOwnerNumber()
      const contactNumber = `+${ownerNumber}`
      const ownerName = 'Warren'
      
      const vcard = 'BEGIN:VCARD\n' +
                    'VERSION:3.0\n' +
                    `FN:${ownerName}\n` +
                    `ORG:${config.botName} Owner;\n` +
                    `TEL;type=CELL;type=VOICE;waid=${ownerNumber}:${contactNumber}\n` +
                    'END:VCARD'

      await sock.sendMessage(jid, { 
        contacts: { 
          displayName: ownerName, 
          contacts: [{ vcard }] 
        } 
      })
      return
    }

    // 2. Broadcast
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

    // 3. Restart
    if (commandName === 'restart') {
      await sock.sendMessage(jid, { text: 'Restarting the engine...' })
      setTimeout(() => process.exit(0), 1000) 
    }
  }
}
