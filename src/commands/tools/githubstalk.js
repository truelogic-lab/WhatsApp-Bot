'use strict'

const axios = require('axios')

module.exports = {
  name: 'githubstalk',
  permission: 'public',
  aliases: ['gitstalk', 'github'],
  execute: async ({ sock, jid, args, config }) => {
    const username = args[0]

    if (!username) {
      return sock.sendMessage(jid, { 
        text: `📌 *Usᴀɢᴇ:* ${config.prefix}githubstalk <username>\nExample: ${config.prefix}githubstalk torvalds` 
      })
    }

    try {
      // Fetch data from GitHub's official public API
      const res = await axios.get(`https://api.github.com/users/${username}`, {
        headers: { 'User-Agent': 'Warren-XMD' }
      })
      const data = res.data

      const stalkText = `╭━━━━━━〔 🐙 ɢɪᴛʜᴜʙ sᴛᴀʟᴋ 〕━━━━━━
│ ◉ ɴᴀᴍᴇ: ${data.name || 'N/A'}
│ ◉ ᴜsᴇʀ: @${data.login}
│ ◉ ʙɪᴏ: ${data.bio || 'No bio'}
│ ◉ ᴄᴏᴍᴘᴀɴʏ: ${data.company || 'N/A'}
│ ◉ ʟᴏᴄᴀᴛɪᴏɴ: ${data.location || 'N/A'}
│ ◉ ʀᴇᴘᴏs: ${data.public_repos}
│ ◉ ɢɪsᴛs: ${data.public_gists}
│ ◉ ғᴏʟʟᴏᴡᴇʀs: ${data.followers}
│ ◉ ғᴏʟʟᴏᴡɪɴɢ: ${data.following}
│ ◉ ᴄʀᴇᴀᴛᴇᴅ: ${new Date(data.created_at).toLocaleDateString()}
╰━━━━━━━━━━━━━━━━━━━━━━━

🔗 *Profile:* ${data.html_url}`

      await sock.sendMessage(jid, { 
        image: { url: data.avatar_url }, 
        caption: stalkText 
      })

    } catch (error) {
      if (error.response && error.response.status === 404) {
        return sock.sendMessage(jid, { text: `❌ GitHub user *${username}* was not found.` })
      }
      throw new Error('Failed to fetch GitHub data. The API might be rate-limited.')
    }
  }
}
