'use strict'

const axios = require('axios')

module.exports = {
  name: 'igstalk',
  permission: 'public',
  aliases: ['instastalk'],
  execute: async ({ sock, jid, args, config }) => {
    const username = args[0]?.replace('@', '')

    if (!username) {
      return sock.sendMessage(jid, { 
        text: `📌 *Usᴀɢᴇ:* ${config.prefix}igstalk <username>\nExample: ${config.prefix}igstalk cristiano` 
      })
    }

    try {
      // Using a public Instagram API proxy
      const res = await axios.get(`https://api.vreden.web.id/api/igstalk?username=${username}`)
      const data = res.data.result

      if (!data || !data.username) throw new Error('User not found')

      const stalkText = `╭━━━━━━〔 📸 ɪɴsᴛᴀɢʀᴀᴍ sᴛᴀʟᴋ 〕━━━━━━
│ ◉ ɴᴀᴍᴇ: ${data.fullname || 'N/A'}
│ ◉ ᴜsᴇʀ: @${data.username}
│ ◉ ʙɪᴏ: ${data.biography || 'No bio'}
│ ◉ ᴘᴏsᴛs: ${data.posts || 0}
│ ◉ ғᴏʟʟᴏᴡᴇʀs: ${data.followers || 0}
│ ◉ ғᴏʟʟᴏᴡɪɴɢ: ${data.following || 0}
│ ◉ ᴠᴇʀɪғɪᴇᴅ: ${data.verified ? 'Yes ✅' : 'No ❌'}
│ ◉ ᴘʀɪᴠᴀᴛᴇ: ${data.private ? 'Yes 🔒' : 'No 🔓'}
╰━━━━━━━━━━━━━━━━━━━━━━━`

      await sock.sendMessage(jid, { 
        image: { url: data.profile_pic }, 
        caption: stalkText 
      })

    } catch (error) {
      await sock.sendMessage(jid, { text: `❌ Failed to find Instagram user *${username}*. The account might be private, deleted, or the API is busy.` })
    }
  }
}
