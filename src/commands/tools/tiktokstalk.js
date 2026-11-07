'use strict'

const axios = require('axios')

module.exports = {
  name: 'tiktokstalk',
  permission: 'public',
  aliases: ['ttstalk'],
  execute: async ({ sock, jid, args, config }) => {
    const username = args[0]?.replace('@', '')

    if (!username) {
      return sock.sendMessage(jid, { 
        text: `📌 *Usᴀɢᴇ:* ${config.prefix}tiktokstalk <username>\nExample: ${config.prefix}tiktokstalk khaby.lame` 
      })
    }

    try {
      // Using a public TikTok API proxy
      const res = await axios.get(`https://api.vreden.web.id/api/tiktokstalk?username=${username}`)
      const data = res.data.result

      if (!data || !data.user) throw new Error('User not found')

      const user = data.user
      const stats = data.stats

      const stalkText = `╭━━━━━━〔 🎵 ᴛɪᴋᴛᴏᴋ sᴛᴀʟᴋ 〕━━━━━━
│ ◉ ɴᴀᴍᴇ: ${user.nickname || 'N/A'}
│ ◉ ᴜsᴇʀ: @${user.uniqueId}
│ ◉ ʙɪᴏ: ${user.signature || 'No bio'}
│ ◉ ᴠɪᴅᴇᴏs: ${stats.videoCount || 0}
│ ◉ ғᴏʟʟᴏᴡᴇʀs: ${stats.followerCount || 0}
│ ◉ ғᴏʟʟᴏᴡɪɴɢ: ${stats.followingCount || 0}
│ ◉ ʟɪᴋᴇs: ${stats.heartCount || 0}
│ ◉ ᴠᴇʀɪғɪᴇᴅ: ${user.verified ? 'Yes ✅' : 'No ❌'}
╰━━━━━━━━━━━━━━━━━━━━━━━

🔗 *Profile:* https://tiktok.com/@${user.uniqueId}`

      await sock.sendMessage(jid, { 
        image: { url: user.avatarLarger }, 
        caption: stalkText 
      })

    } catch (error) {
      await sock.sendMessage(jid, { text: `❌ Failed to find TikTok user *${username}*. The API might be rate-limited.` })
    }
  }
}
