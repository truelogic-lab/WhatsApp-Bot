'use strict'

module.exports = {
  name: 'repo',
  permission: 'public',
  execute: async ({ sock, jid, config }) => {
    const repoText = `╭━━━━━━〔 📂 sᴏᴜʀᴄᴇ ᴄᴏᴅᴇ 〕━━━━━━
│ ◉ ʙᴏᴛ: ${config.botName}
│ ◉ ᴠᴇʀsɪᴏɴ: ${config.version}
│ ◉ ᴛʏᴘᴇ: Node.js / Baileys
╰━━━━━━━━━━━━━━━━━━━━━━━

🔗 *GitHub Repository:*
https://github.com/truelogic-lab/WhatsApp-Bot

💡 *Note:* Do not forget to leave a ⭐️ (star) on the repository if you find it useful!`

    await sock.sendMessage(jid, { text: repoText })
  }
}
