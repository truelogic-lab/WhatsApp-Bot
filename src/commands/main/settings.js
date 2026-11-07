'use strict'

module.exports = {
  name: 'settings',
  permission: 'public',
  execute: async ({ sock, jid, config, startTime }) => {
    const speed = Date.now() - startTime
    
    const settingsText = `╭━━━━━━〔 sᴇᴛᴛɪɴɢs & sᴛᴀᴛᴜs 〕━━━━━━
│ ◉ ᴍᴏᴅᴇ: ${config.settings.mode.toUpperCase()}
│ ◉ ᴘʀᴇғɪx: ${config.prefix}
│ ◉ ᴠᴇʀsɪᴏɴ: ${config.version}
╰━━━━━━━━━━━━━━━━━━━━━━━

╭━━━━━━〔 ᴀᴜᴛᴏᴍᴀᴛɪᴏɴ 〕━━━━━━
│ ◉ ᴀᴜᴛᴏ-sᴛᴀᴛᴜs: ${config.settings.autoStatus ? 'ON' : 'OFF'}
│ ◉ ᴀᴜᴛᴏ-ᴛʏᴘɪɴɢ: ${config.settings.autoTyping ? 'ON' : 'OFF'}
│ ◉ ᴀᴜᴛᴏ-ʀᴇᴀᴄᴛ: ${config.settings.autoReact ? 'ON' : 'OFF'}
╰━━━━━━━━━━━━━━━━━━━━━━━

> *⚡ ${config.ownerName}-ᴍᴅ ꜱᴘᴇᴇᴅ: ${speed}ᴍꜱ 🔥*`

    await sock.sendMessage(jid, { text: settingsText })
  }
}
