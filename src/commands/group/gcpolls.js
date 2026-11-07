'use strict'

module.exports = {
  name: 'gcpolls',
  permission: 'public',
  aliases: ['poll', 'chvote'],
  execute: async ({ sock, msg, jid, args, commandName, config }) => {
    if (commandName === 'poll') {
      const input = args.join(' ')
      if (!input.includes('|')) return sock.sendMessage(jid, { text: `📌 *Usᴀɢᴇ:* ${config.prefix}poll Question | Option 1 | Option 2` })

      const parts = input.split('|').map(p => p.trim())
      const question = parts.shift()
      const options = parts

      if (options.length < 2) return sock.sendMessage(jid, { text: 'Provide at least 2 options.' })

      await sock.sendMessage(jid, {
        poll: { name: question, values: options, selectableCount: 1 }
      })
      return
    }

    if (commandName === 'chvote') {
      return sock.sendMessage(jid, { text: 'To vote, simply tap on the option in the poll message above.' })
    }
  }
}
