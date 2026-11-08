'use strict'

const { updateSetting } = require('../../utils/database')

module.exports = {
  name: 'antidelete',
  permission: 'owner',
  aliases: ['antilink', 'antistatusmention'],
  execute: async ({ sock, jid, args, config, commandName }) => {
    const action = args[0]?.toLowerCase()

    // --- ANTI-DELETE ---
    if (commandName === 'antidelete') {
      if (action === 'on' || action === 'off') {
        const state = action === 'on'
        config.settings.antiDelete = state
        updateSetting('antiDelete', state)
        return sock.sendMessage(jid, { text: `✅ Anti-Delete is now *${state ? 'ON' : 'OFF'}*` })
      }
      return sock.sendMessage(jid, { text: `Usage: ${config.prefix}antidelete on/off` })
    }

    // --- ANTI-LINK ---
    if (commandName === 'antilink') {
      if (action === 'on') {
        config.settings.antiLink = 'kick'
        updateSetting('antiLink', 'kick')
        return sock.sendMessage(jid, { text: `✅ Anti-Link enabled. Mode: *KICK*` })
      } 
      else if (action === 'warn') {
        config.settings.antiLink = 'warn'
        updateSetting('antiLink', 'warn')
        return sock.sendMessage(jid, { text: `✅ Anti-Link enabled. Mode: *WARN*` })
      }
      else if (action === 'off') {
        config.settings.antiLink = false
        updateSetting('antiLink', false)
        return sock.sendMessage(jid, { text: `❌ Anti-Link disabled.` })
      }
      else {
        const status = config.settings.antiLink ? `ON (${config.settings.antiLink.toUpperCase()})` : 'OFF'
        return sock.sendMessage(jid, { 
          text: `🔗 *ANTI-LINK SYSTEM*\n\n📌 *Usᴀɢᴇ:*\n${config.prefix}antilink on (Kick mode)\n${config.prefix}antilink warn (Warn mode)\n${config.prefix}antilink off\n\n*Cᴜʀʀᴇɴᴛ:* ${status}` 
        })
      }
    }

    // --- ANTI-STATUS MENTION ---
    if (commandName === 'antistatusmention') {
      if (action === 'on' || action === 'off') {
        const state = action === 'on'
        config.settings.antiStatusMention = state
        updateSetting('antiStatusMention', state)
        return sock.sendMessage(jid, { text: `✅ Anti-Status Mention is now *${state ? 'ON' : 'OFF'}*` })
      }
      const status = config.settings.antiStatusMention ? 'ON' : 'OFF'
      return sock.sendMessage(jid, { text: `👁️ *ANTI-STATUS MENTION*\n\n📌 *Usᴀɢᴇ:* ${config.prefix}antistatusmention on/off\n*Cᴜʀʀᴇɴᴛ:* ${status}` })
    }
  }
}
