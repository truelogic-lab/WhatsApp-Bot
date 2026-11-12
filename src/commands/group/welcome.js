'use strict'

const { loadDB, saveDB, updateSetting } = require('../../utils/database')

module.exports = {
  name: 'welcome',
  permission: 'admin',
  aliases: ['goodbye', 'setwelcome', 'setgoodbye'],
  execute: async ({ sock, jid, args, config, commandName }) => {
    if (!jid.endsWith('@g.us')) {
      return sock.sendMessage(jid, { text: 'This command can only be used in groups.' })
    }

    const db = loadDB()
    const action = args[0]?.toLowerCase()

    // --- WELCOME ON/OFF ---
    if (commandName === 'welcome') {
      if (action === 'on' || action === 'off') {
        const state = action === 'on'
        config.settings.welcome = state
        updateSetting('welcome', state)
        return sock.sendMessage(jid, { text: `✅ Welcome messages are now *${state ? 'ON' : 'OFF'}*` })
      }
      return sock.sendMessage(jid, { text: `Usage: ${config.prefix}welcome on/off` })
    }

    // --- GOODBYE ON/OFF ---
    if (commandName === 'goodbye') {
      if (action === 'on' || action === 'off') {
        const state = action === 'on'
        config.settings.goodbye = state
        updateSetting('goodbye', state)
        return sock.sendMessage(jid, { text: `✅ Goodbye messages are now *${state ? 'ON' : 'OFF'}*` })
      }
      return sock.sendMessage(jid, { text: `Usage: ${config.prefix}goodbye on/off` })
    }

    // --- SET WELCOME MESSAGE ---
    if (commandName === 'setwelcome') {
      const message = args.join(' ')
      if (!message) return sock.sendMessage(jid, { text: 'Provide a message. Use @user to mention the new member.' })
      
      if (!db.welcomeMessages) db.welcomeMessages = {}
      db.welcomeMessages[jid] = message
      saveDB(db)
      return sock.sendMessage(jid, { text: `✅ Custom welcome message saved!\n\n*Preview:*\n${message.replace(/@user/g, '@NewMember')}` })
    }

    // --- SET GOODBYE MESSAGE ---
    if (commandName === 'setgoodbye') {
      const message = args.join(' ')
      if (!message) return sock.sendMessage(jid, { text: 'Provide a message. Use @user to mention the leaving member.' })
      
      if (!db.goodbyeMessages) db.goodbyeMessages = {}
      db.goodbyeMessages[jid] = message
      saveDB(db)
      return sock.sendMessage(jid, { text: `✅ Custom goodbye message saved!\n\n*Preview:*\n${message.replace(/@user/g, '@LeavingMember')}` })
    }
  }
}
