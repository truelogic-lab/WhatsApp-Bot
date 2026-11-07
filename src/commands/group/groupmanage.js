'use strict'

module.exports = {
  name: 'groupmanage',
  permission: 'admin',
  aliases: ['mute', 'unmute', 'link', 'revoke', 'ginfo', 'updategdesc', 'updategname', 'gcpp'],
  execute: async ({ sock, msg, jid, args, commandName, config }) => {
    try {
      // --- MUTE / UNMUTE ---
      if (commandName === 'mute') {
        await sock.groupSettingUpdate(jid, 'announcement')
        return sock.sendMessage(jid, { text: '🔇 Group has been muted. Only admins can send messages.' })
      }
      if (commandName === 'unmute') {
        await sock.groupSettingUpdate(jid, 'not_announcement')
        return sock.sendMessage(jid, { text: '🔊 Group has been unmuted. Everyone can send messages.' })
      }

      // --- LINK / REVOKE ---
      if (commandName === 'link') {
        const code = await sock.groupInviteCode(jid)
        return sock.sendMessage(jid, { text: `🔗 *Group Link:*\nhttps://chat.whatsapp.com/${code}` })
      }
      if (commandName === 'revoke') {
        await sock.groupRevokeInvite(jid)
        return sock.sendMessage(jid, { text: '♻️ Group invite link has been reset. The old link is now invalid.' })
      }

      // --- GINFO ---
      if (commandName === 'ginfo') {
        const metadata = await sock.groupMetadata(jid)
        const admins = metadata.participants.filter(p => p.admin !== null).length
        return sock.sendMessage(jid, { 
          text: `📊 *Group Info*\n\n*Name:* ${metadata.subject}\n*Members:* ${metadata.participants.length}\n*Admins:* ${admins}\n*Created:* ${new Date(metadata.creation * 1000).toLocaleDateString()}\n*ID:* ${metadata.id}` 
        })
      }

      // --- UPDATE GDESC / GNAME ---
      if (commandName === 'updategname') {
        const name = args.join(' ')
        if (!name) return sock.sendMessage(jid, { text: 'Provide a new group name.' })
        await sock.groupUpdateSubject(jid, name)
        return sock.sendMessage(jid, { text: `✅ Group name updated to: *${name}*` })
      }
      if (commandName === 'updategdesc') {
        const desc = args.join(' ')
        if (!desc) return sock.sendMessage(jid, { text: 'Provide a new group description.' })
        await sock.groupUpdateDescription(jid, desc)
        return sock.sendMessage(jid, { text: `✅ Group description updated.` })
      }

      // --- GCPP (Group Profile Picture) ---
      if (commandName === 'gcpp') {
        const quotedMsg = msg.message.extendedTextMessage?.contextInfo?.quotedMessage
        if (!quotedMsg?.imageMessage) return sock.sendMessage(jid, { text: 'Reply to an image to set it as the group profile picture.' })
        
        const { downloadMediaMessage } = require('@whiskeysockets/baileys')
        const targetMsg = { key: msg.key, message: quotedMsg }
        const buffer = await downloadMediaMessage(targetMsg, 'buffer', {}, { logger: console })
        
        await sock.updateProfilePicture(jid, buffer)
        return sock.sendMessage(jid, { text: '✅ Group profile picture updated.' })
      }

    } catch (error) {
      throw new Error('Failed to execute group action. Ensure the bot is an admin.')
    }
  }
}
