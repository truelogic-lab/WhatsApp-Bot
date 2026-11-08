'use strict'

const { getCommandCount } = require('../../handlers/loader')
const fs = require('fs')
const path = require('path')
const { getOwnerName, getFooter } = require('../../utils/branding')

module.exports = {
  name: 'menu',
  permission: 'public',
  execute: async ({ sock, jid, config, startTime }) => {
    const speed = Date.now() - startTime
    const uptimeSec = process.uptime()
    const uptime = `${Math.floor(uptimeSec / 3600)}h ${Math.floor((uptimeSec % 3600) / 60)}m ${Math.floor(uptimeSec % 60)}s`
    const cmdCount = getCommandCount()

    const list = (cmds) => cmds.map(c => `│ ◉ ➤ ${c}`).join('\n')

    const menuText = `╭━━━━━━〔 ʙᴏᴛ ɪɴғᴏ 〕━━━━━━
│ ◉ ɴᴀᴍᴇ: ${config.botName}
│ ◉ ᴏᴡɴᴇʀ: ${getOwnerName()}
│ ◉ ᴍᴏᴅᴇ: ${config.settings.mode.toUpperCase()}
│ ◉ ᴄᴏᴍᴍᴀɴᴅs: ${cmdCount}
│ ◉ ᴜᴘᴛɪᴍᴇ: ${uptime}
│ ◉ ᴠᴇʀsɪᴏɴ: ${config.version}
╰━━━━━━━━━━━━━━━━━━━━━━━

╭━━━━━━〔 ᴍᴀɪɴ 〕━━━━━━
${list(['ping', 'menu', 'mode', 'repo', 'botname', 'description', 'botdp', 'join', 'owner', 'prefix', 'update', 'restart', 'settings', 'broadcast'])}
╰━━━━━━━━━━━━━━━━━━━━━━━

╭━━━━━━〔 ᴛᴏᴏʟs 〕━━━━━━
${list(['vv', 'img', 'calc', 'take', 'story', 'react', 'toimg', 'ssweb', 'setdp', 'getdp', 'sticker', 'morning', 'birthday', 'autoview', 'tts', 'autobio', 'autopost', 'anticall', 'autoreact', 'autostatus', 'autoreply', 'statusreact', 'channelreact'])}
╰━━━━━━━━━━━━━━━━━━━━━━━

╭━━━━━━〔 sᴇᴀʀᴄʜ & ᴀɪ 〕━━━━━━
${list(['ai', 'gpt', '8ball', 'imagine', 'dare', 'rate', 'truth', 'lyrics', 'weather', 'igstalk', 'githubstalk', 'compatibility', 'tiktokstalk'])}
╰━━━━━━━━━━━━━━━━━━━━━━━

╭━━━━━━〔 ᴅᴏᴡɴʟᴏᴀᴅ 〕━━━━━━
${list(['play', 'tiktok', 'instagram'])}
╰━━━━━━━━━━━━━━━━━━━━━━━

╭━━━━━━〔 ɢʀᴏᴜᴘ sᴇᴛᴛɪɴɢs 〕━━━━━━
${list(['tag', 'link', 'gcpp', 'mute', 'poll', 'ginfo', 'revoke', 'unmute', 'tagall', 'chvote', 'gcstatus', 'updategname', 'updategdesc'])}
╰━━━━━━━━━━━━━━━━━━━━━━━

╭━━━━━━〔 ɢʀᴏᴜᴘ ᴀᴄᴛɪᴏɴs 〕━━━━━━
${list(['add', 'end', 'out', 'topactive', 'topactive', 'kick', 'accept', 'reject', 'invite', 'newgc', 'demote', 'promote', 'requests', 'acceptall', 'rejectall', 'antilink', 'antidelete'])}
╰━━━━━━━━━━━━━━━━━━━━━━━

╭━━━━━━〔 ᴇᴍᴏᴊɪ ᴇғғᴇᴄᴛs 〕━━━━━━
${list(['cry', 'hot', 'hug', 'joy', 'moon', 'pat', 'sad', 'shy', 'sus', 'wave', 'wink', 'bite', 'cool', 'dare', 'flip', 'hate', 'joke', 'kiss', 'lick', 'love', 'nerd', 'pick', 'poke', 'poor', 'rich', 'roll', 'slap', 'slow', 'smug', 'tail', 'yeet', 'blush', 'bonk', 'bruh', 'clap', 'faint', 'fancy', 'flag', 'fast', 'kill', 'laugh', 'lucky', 'pray', 'sick', 'slam', 'weak', 'angry', 'bored', 'crush', 'cuddle', 'dance', 'dumb', 'happy', 'heart', 'hungry', 'nerdy', 'proud', 'smart', 'tired', 'brain', 'brave', 'calm', 'clumsy', 'confused', 'cringe', 'dream', 'grumpy', 'honest', 'humble', 'jealous', 'kind', 'lazy', 'lonely', 'mystic', 'nervous', 'polite', 'quiet', 'sassy', 'silly', 'sleepy', 'strong', 'stupid', 'sweat', 'thankful', 'thirsty', 'tickle', 'unlucky', 'weird', 'win', 'worry'])}
╰━━━━━━━━━━━━━━━━━━━━━━━

> *⚡ ${getOwnerName()}-ᴍᴅ | ${getFooter()} | ꜱᴘᴇᴇᴅ: ${speed}ᴍꜱ 🔥*`

    const imagePath = path.join(__dirname, '../../../assets/menu.png')
    const contextInfo = {
      forwardingScore: 999,
      isForwarded: true,
      forwardedNewsletterMessageInfo: {
        newsletterJid: '0029Vb9HOWtFy72BOhfOqm0Q@newsletter',
        newsletterName: '𝐊𝐈𝐍𝐆𝐃𝐎𝐌 𝐎𝐅 𝐂𝐎𝐃𝐄',
        serverMessageId: -1
      }
    }

    try {
      if (fs.existsSync(imagePath)) {
        await sock.sendMessage(jid, { image: fs.readFileSync(imagePath), caption: menuText, contextInfo })
      } else {
        await sock.sendMessage(jid, { text: menuText, contextInfo })
      }
    } catch (error) {
      await sock.sendMessage(jid, { text: menuText, contextInfo })
    }
  }
}
