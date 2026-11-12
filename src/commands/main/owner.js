'use strict'

const { getOwnerNumber } = require('../../handlers/permissions')

module.exports = {
  name: 'owner',
  permission: 'public', // Anyone can use it
  execute: async ({ sock, jid, config }) => {
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
  }
}
