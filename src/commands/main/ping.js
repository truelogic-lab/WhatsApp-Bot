'use strict'

const { getOwnerName, getFooter } = require('../../utils/branding')

module.exports = {
  name: 'ping',
  permission: 'public',
  execute: async ({ sock, jid, startTime }) => {
    const speed = Date.now() - startTime

    const pingText = `╭━━━━━━〔 ⚡ ᴘɪɴɢ 〕━━━━━━
│ ◉ sᴛᴀᴛᴜs: 🟢 ᴏɴʟɪɴᴇ
│ ◉ ʟᴀᴛᴇɴᴄʏ: ${speed}ᴍꜱ
│ ◉ ᴇɴɢɪɴᴇ: ɴᴏᴅᴇ.ᴊꜱ
╰━━━━━━━━━━━━━━━━━━━━━━━

> *⚡ ${getOwnerName()}-ᴍᴅ | ${getFooter()}*`

    await sock.sendMessage(jid, { text: pingText })
  }
}
