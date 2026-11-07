'use strict'

module.exports = {
  name: 'react',
  permission: 'public',
  execute: async ({ sock, msg, args, jid }) => {
    const emoji = args[0]
    const quotedMsg = msg.message.extendedTextMessage?.contextInfo?.stanzaId

    if (!emoji) return sock.sendMessage(jid, { text: 'Provide an emoji to react with.' })
    if (!quotedMsg) return sock.sendMessage(jid, { text: 'Reply to a message to react to it.' })

    await sock.sendMessage(jid, {
      react: { text: emoji, key: { ...msg.key, id: quotedMsg } }
    })
  }
}
