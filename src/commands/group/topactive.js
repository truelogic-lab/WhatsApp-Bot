'use strict'

const { loadDB } = require('../../utils/database')

module.exports = {
  name: 'topactive',
  permission: 'admin',
  execute: async ({ sock, msg, jid, args, config }) => {
    const db = loadDB()
    const groupActivity = db.activity[jid]

    if (!groupActivity || Object.keys(groupActivity).length === 0) {
      return sock.sendMessage(jid, { text: '❌ No activity data collected yet for this group.' })
    }

    // Sort users by message count (highest first)
    const sortedUsers = Object.entries(groupActivity)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3) // Get Top 3

    const winnerJid = sortedUsers[0][0]
    const winnerCount = sortedUsers[0][1]

    let leaderboard = `🏆 *GROUP ACTIVITY LEADERBOARD* 🏆\n\n`
    
    // Emojis for top 3
    const medals = ['🥇', '🥈', '🥉']

    sortedUsers.forEach((user, index) => {
      leaderboard += `${medals[index]} @${user[0].split('@')[0]} - *${user[1]}* messages\n`
    })

    const rewardMessage = args.length > 0 ? args.join(' ') : `Thank you for keeping this group alive! You are the real MVP! 🎉`

    const finalText = `╭━━━━━━〔 🌟 ᴛᴏᴘ ᴀᴄᴛɪᴠᴇ 〕━━━━━━
│ ◉ ɢʀᴏᴜᴘ: ${msg.key.remoteJid.split('@')[0]}
│ ◉ ɴᴏᴛɪғʏɪɴɢ: @${winnerJid.split('@')[0]}
╰━━━━━━━━━━━━━━━━━━━━━━━

${leaderboard}

🎁 *Reward for @${winnerJid.split('@')[0]}:*
${rewardMessage}`

    await sock.sendMessage(jid, { 
      text: finalText, 
      mentions: sortedUsers.map(u => u[0]) // Tags the top 3 users
    })
  }
}
