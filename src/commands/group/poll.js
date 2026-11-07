'use strict'

module.exports = {
  name: 'poll',
  permission: 'public',
  execute: async ({ sock, jid, args, msg, config }) => {
    const input = args.join(' ')

    if (!input || !input.includes('|')) {
      return sock.sendMessage(jid, { 
        text: `📌 *Usᴀɢᴇ:* ${config.prefix}poll Question | Option 1 | Option 2\n\n*Example:*\n${config.prefix}poll What should we eat? | Pizza | Burgers | Sushi` 
      })
    }

    // Split the input by the pipe character
    const parts = input.split('|').map(part => part.trim())
    const question = parts.shift() // The first part is the question
    const options = parts            // The rest are the options

    if (options.length < 2) {
      return sock.sendMessage(jid, { text: 'You must provide at least 2 options for a poll.' })
    }

    if (options.length > 12) {
      return sock.sendMessage(jid, { text: 'WhatsApp allows a maximum of 12 options per poll.' })
    }

    try {
      await sock.sendMessage(jid, { 
        poll: {
          name: question,
          values: options,
          selectableCount: 1 // Users can only select 1 option
        }
      })
    } catch (error) {
      throw new Error('Failed to create the poll.')
    }
  }
}
