'use strict'

const { getCommandCount } = require('../../handlers/loader')
const fs = require('fs')
const path = require('path')

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
│ ◉ ᴏᴡɴᴇʀ: Warren
│ ◉ ᴍᴏᴅᴇ: ${config.settings.mode.toUpperCase()}
│ ◉ ᴄᴏᴍᴍᴀɴᴅs: ${cmdCount}
│ ◉ ᴜᴘᴛɪᴍᴇ: ${uptime}
│ ◉ ᴠᴇʀsɪᴏɴ: ${config.version}
╰━━━━━━━━━━━━━━━━━━━━━━━

╭━━━━━━〔 ᴍᴀɪɴ 〕━━━━━━
${list(['ping', 'menu', 'settings', 'mode', 'prefix', 'repo', 'update', 'join', 'owner', 'broadcast', 'restart'])}
╰━━━━━━━━━━━━━━━━━━━━━━━

╭━━━━━━〔 ᴛᴏᴏʟs 〕━━━━━━
${list(['sticker', 'toimg', 'take', 'vv', 'react', 'setdp', 'getdp', 'img', 'calc', 'ssweb', 'story', 'autostatus', 'autoreact', 'statusreact', 'channelreact', 'autobio', 'autopost', 'autoreply', 'anticall'])}
╰━━━━━━━━━━━━━━━━━━━━━━━

╭━━━━━━〔 sᴇᴀʀᴄʜ & ᴀɪ 〕━━━━━━
${list(['ai', 'gpt', 'weather', 'lyrics'])}
╰━━━━━━━━━━━━━━━━━━━━━━━

╭━━━━━━〔 ᴅᴏᴡɴʟᴏᴀᴅ 〕━━━━━━
${list(['play', 'tiktok', 'instagram'])}
╰━━━━━━━━━━━━━━━━━━━━━━━

╭━━━━━━〔 ɢʀᴏᴜᴘ sᴇᴛᴛɪɴɢs 〕━━━━━━
${list(['mute', 'unmute', 'link', 'revoke', 'ginfo', 'updategname', 'updategdesc', 'gcpp', 'poll', 'chvote', 'gcstatus', 'tagall', 'tag'])}
╰━━━━━━━━━━━━━━━━━━━━━━━

╭━━━━━━〔 ɢʀᴏᴜᴘ ᴀᴄᴛɪᴏɴs 〕━━━━━━
${list(['kick', 'promote', 'demote', 'add', 'newgc', 'out', 'end', 'invite', 'accept', 'reject', 'acceptall', 'rejectall', 'requests', 'antidelete', 'antilink'])}
╰━━━━━━━━━━━━━━━━━━━━━━━

╭━━━━━━〔 ᴇᴍᴏᴊɪ ᴇғғᴇᴄᴛs 〕━━━━━━
${list(['happy', 'sad', 'angry', 'shy', 'moon', 'confused', 'hot', 'fancy', 'flag', 'heart', 'laugh', 'cry', 'blush', 'bonk', 'cuddle', 'hug', 'kiss', 'lick', 'pat', 'slap', 'smug', 'wave', 'wink', 'bite', 'poke', 'dance', 'kill', 'tail', 'tickle', 'roll', 'flip', 'pick', 'joke', 'truth', 'dare', 'shrug', 'facepalm', 'yeet', 'triggered', 'scream', 'faint', 'clap', 'pray', 'salute', 'cringe', 'bruh', 'sus', 'sigma', 'nervous', 'bored', 'sleepy', 'hungry', 'thirsty', 'sick', 'cool', 'nerd', 'rich', 'poor', 'strong', 'weak', 'fast', 'slow', 'smart', 'dumb', 'lucky', 'unlucky', 'love', 'hate'])}
╰━━━━━━━━━━━━━━━━━━━━━━━

> *⚡ Warren-ᴍᴅ ꜱᴘᴇᴇᴅ: ${speed}ᴍꜱ 🔥*`

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
