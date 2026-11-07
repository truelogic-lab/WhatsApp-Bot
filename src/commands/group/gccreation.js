'use strict'

module.exports = {
  name: 'gccreation',
  permission: 'owner',
  aliases: ['newgc', 'end', 'out'],
  execute: async ({ sock, msg, jid, args, commandName }) => {
    try {
      if (commandName === 'newgc') {
        const groupName = args.join(' ')
        if (!groupName) return sock.sendMessage(jid, { text: 'Provide a name for the new group.' })
        
        const group = await sock.groupCreate(groupName, [])
        await sock.sendMessage(jid, { text: `✅ Group created successfully!\n\nName: *${group.subject}*\nLink: https://chat.whatsapp.com/${await sock.groupInviteCode(group.id)}` })
        return
      }

      if (commandName === 'out' || commandName === 'end') {
        if (!jid.endsWith('@g.us')) return sock.sendMessage(jid, { text: 'This command is for groups only.' })
        
        await sock.sendMessage(jid, { text: '👋 Leaving group...' })
        await sock.groupLeave(jid)
        return
      }
    } catch (error) {
      throw new Error('Failed to execute action.')
    }
  }
}
