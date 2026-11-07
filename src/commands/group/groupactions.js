'use strict'

module.exports = {
  name: 'groupactions',
  permission: 'admin',
  aliases: ['kick', 'promote', 'demote', 'add', 'tagall', 'tag', 'accept', 'reject', 'acceptall', 'rejectall', 'requests'],
  execute: async ({ sock, msg, jid, args, commandName }) => {
    const quotedParticipant = msg.message.extendedTextMessage?.contextInfo?.participant

    try {
      // --- TAGALL / TAG ---
      if (commandName === 'tagall' || commandName === 'tag') {
        const text = args.join(' ') || 'Attention everyone!'
        const metadata = await sock.groupMetadata(jid)
        const participants = metadata.participants.map(p => p.id)
        
        let tagText = `📢 *Announcement:* ${text}\n\n`
        participants.forEach(p => { tagText += `@${p.split('@')[0]}\n` })
        
        return sock.sendMessage(jid, { text: tagText, mentions: participants })
      }

      // --- REQUESTS ---
      if (commandName === 'requests') {
        const requests = await sock.groupRequestParticipantsList(jid)
        if (requests.length === 0) return sock.sendMessage(jid, { text: 'No pending join requests.' })
        
        let text = '📋 *Pending Requests:*\n\n'
        requests.forEach(r => { text += `@${r.jid.split('@')[0]}\n` })
        return sock.sendMessage(jid, { text, mentions: requests.map(r => r.jid) })
      }

      // --- ACCEPT / REJECT (ALL) ---
      if (['acceptall', 'rejectall'].includes(commandName)) {
        const requests = await sock.groupRequestParticipantsList(jid)
        if (requests.length === 0) return sock.sendMessage(jid, { text: 'No pending requests.' })
        
        const jids = requests.map(r => r.jid)
        const action = commandName === 'acceptall' ? 'approve' : 'reject'
        await sock.groupRequestParticipantsUpdate(jid, jids, action)
        return sock.sendMessage(jid, { text: `✅ Successfully ${action}d all ${jids.length} requests.` })
      }

      // --- MEMBER SPECIFIC ACTIONS (Requires Reply) ---
      if (['kick', 'promote', 'demote', 'accept', 'reject'].includes(commandName)) {
        if (!quotedParticipant) {
          return sock.sendMessage(jid, { text: `Reply to the user's message to ${commandName} them.` })
        }

        if (commandName === 'kick') {
          await sock.groupParticipantsUpdate(jid, [quotedParticipant], 'remove')
          return sock.sendMessage(jid, { text: '✅ User removed from group.' })
        }
        if (commandName === 'promote') {
          await sock.groupParticipantsUpdate(jid, [quotedParticipant], 'promote')
          return sock.sendMessage(jid, { text: '✅ User promoted to admin.' })
        }
        if (commandName === 'demote') {
          await sock.groupParticipantsUpdate(jid, [quotedParticipant], 'demote')
          return sock.sendMessage(jid, { text: '✅ User demoted from admin.' })
        }
        if (commandName === 'accept') {
          await sock.groupRequestParticipantsUpdate(jid, [quotedParticipant], 'approve')
          return sock.sendMessage(jid, { text: '✅ User accepted into group.' })
        }
        if (commandName === 'reject') {
          await sock.groupRequestParticipantsUpdate(jid, [quotedParticipant], 'reject')
          return sock.sendMessage(jid, { text: '✅ User rejected from joining.' })
        }
      }

      // --- ADD (Requires Number) ---
      if (commandName === 'add') {
        const number = args[0]?.replace(/[^0-9]/g, '')
        if (!number) return sock.sendMessage(jid, { text: 'Provide a phone number to add.' })
        
        const res = await sock.groupParticipantsUpdate(jid, [`${number}@s.whatsapp.net`], 'add')
        if (res[0].status === '200') {
          return sock.sendMessage(jid, { text: '✅ User added successfully.' })
        } else {
          return sock.sendMessage(jid, { text: `❌ Failed to add user. Status: ${res[0].status}` })
        }
      }

    } catch (error) {
      throw new Error(`Action failed. Ensure the bot is admin and has permission.`)
    }
  }
}
