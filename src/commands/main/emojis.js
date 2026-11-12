'use strict'

const { updateSetting } = require('../../utils/database')

module.exports = {
  name: 'reactemojis',
  permission: 'owner',
  aliases: ['owneremojis'],
  execute: async ({ sock, jid, args, config, commandName }) => {
    const input = args.join('')

    if (!input) {
      const current = commandName === 'reactemojis' ? config.settings.reactEmojis : config.settings.ownerEmojis
      return sock.sendMessage(jid, { 
        text: `📌 *Usᴀɢᴇ:* ${config.prefix}${commandName} 😍,❤️,🔥\n*Cᴜʀʀᴇɴᴛ:* ${current}` 
      })
    }

    // Split by comma and trim whitespace
    const emojiArray = input.split(',').map(e => e.trim()).filter(e => e.length > 0)

    if (emojiArray.length < 2) {
      return sock.sendMessage(jid, { text: '❌ Please provide at least 2 emojis separated by commas.' })
    }

    const emojiString = emojiArray.join(',')

    if (commandName === 'reactemojis') {
      config.settings.reactEmojis = emojiString
      updateSetting('reactEmojis', emojiString)
      await sock.sendMessage(jid, { text: `✅ Auto-React emojis updated to: ${emojiString}` })
    } 
    else if (commandName === 'owneremojis') {
      config.settings.ownerEmojis = emojiString
      updateSetting('ownerEmojis', emojiString)
      await sock.sendMessage(jid, { text: `✅ Owner emojis updated to: ${emojiString}` })
    }
  }
}
