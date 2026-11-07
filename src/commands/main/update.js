'use strict'

module.exports = {
  name: 'update',
  permission: 'owner',
  execute: async ({ sock, jid }) => {
    // Return the disabled message immediately
    await sock.sendMessage(jid, { 
      text: '🚫 This command has been permanently disabled.' 
    })
  }
}
