'use strict'

module.exports = {
  name: 'ping',
  execute: async ({ sock, jid, config, startTime }) => {
    const speed = Date.now() - startTime
    await sock.sendMessage(jid, { 
      text: `Pong!\n\nSpeed: ${speed}ms` 
    })
  }
}
