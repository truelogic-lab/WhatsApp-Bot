'use strict'

const { evaluate } = require('mathjs')

module.exports = {
  name: 'calc',
  permission: 'public',
  aliases: ['calculate', 'math'],
  execute: async ({ sock, jid, args, config }) => {
    const expression = args.join(' ')
    if (!expression) {
      return sock.sendMessage(jid, { text: `Provide a math expression.\n\nUsage:\n${config.prefix}calc 2 + 2 * 5` })
    }

    try {
      // mathjs safely evaluates the expression without executing arbitrary code
      const result = evaluate(expression)
      await sock.sendMessage(jid, { 
        text: `📐 *Expression:* ${expression}\n✅ *Result:* ${result}` 
      })
    } catch (error) {
      await sock.sendMessage(jid, { text: 'Invalid mathematical expression.' })
    }
  }
}
