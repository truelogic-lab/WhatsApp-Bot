'use strict'

const config = require('../../../config')
const { getOwnerNumber } = require('../../handlers/permissions')

module.exports = {
  name: 'settings',
  permission: 'owner',
  execute: async ({ sock, jid, startTime }) => {
    const speed = Date.now() - startTime
    
    // Helper to format booleans
    const b = (val) => val ? 'true' : 'false'
    const antiLinkStatus = config.settings.antiLink ? (config.settings.antiLink === 'warn' ? 'warn' : 'true') : 'false'

    const settingsText = `
┌─⧽ *ꨄ ${config.botName.toUpperCase()} ꨄ Settings Menu* ⚙️
│
│ 📁 *General Settings*
│ • welcome on/off
│ • goodbye on/off
│ • setwelcome <message>
│ • setgoodbye <message>
│
│ 📁 *Anti Features*
│ • antiedit on/off
│ • editpath inbox/same
│ • antilink on/off/warn/delete
│ • antidelete on/off
│ • anticall on/off
│ • anticallmsg <message>
│
│ 📁 *Auto Features*
│ • autoread on/off
│ • recording on/off
│ • statusview on/off
│ • autoreact on/off
│ • autotyping on/off
│ • online on/off
│
│ 📁 *Settings*
│ • ban @user
│ • unban @user
│ • banlist
│ • sudo @user
│ • delsudo @user
│ • listsudo
│
│ 📁 *Bot Settings*
│ • mode public/private/inbox
│ • prefix <new_prefix>
│ • botname <name>
│ • ownername <name>
│ • ownernumber <number>
│ • description <text>
│ • botdp <url> or reply to image
│ • stickername <name>
│ • delpath same/inbox
│ • reactemojis 😍,❤️,🔥
│ • owneremojis 👑,⭐,💎
│
│ 📁 *Current Status*
│ • Welcome: ${b(config.settings.welcome)}
│ • Goodbye: ${b(config.settings.goodbye)}
│ • Anti-Edit: ${b(false)} 
│ • Anti-Link: ${antiLinkStatus}
│ • Anti-Delete: ${b(config.settings.antiDelete)}
│ • Anti-Call: ${b(config.settings.antiCall)}
│ • Auto-Read: ${b(false)}
│ • Auto-React: ${b(config.settings.autoReact)}
│ • Auto-Typing: ${b(config.settings.autoTyping)}
│ • Always Online: ${b(config.settings.alwaysOnline)}
│ • Mode: ${config.settings.mode}
│ • Prefix: ${config.prefix}
│
│ 📌 *Tip:* Use ${config.prefix}help <command> for more details
└──────────────────────────

> *⚡ ${config.ownerName}-ᴍᴅ ꜱᴘᴇᴇᴅ: ${speed}ᴍꜱ 🔥*`.trim()

    await sock.sendMessage(jid, { text: settingsText })
  }
}
