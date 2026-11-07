'use strict'

const axios = require('axios')

module.exports = {
  name: 'ai',
  permission: 'public',
  aliases: ['gpt', 'chatgpt', 'claude', 'gemini', 'llama'],
  execute: async ({ sock, jid, args, config }) => {
    const prompt = args.join(' ')
    
    if (!prompt) {
      return sock.sendMessage(jid, { text: `Provide a prompt.\n\nUsage:\n${config.prefix}ai What is the capital of Kenya?` })
    }


    try {
      // Using a fast, free AI proxy
      const res = await axios.get(`https://api.ryzendesu.vip/api/ai/chatgpt?text=${encodeURIComponent(prompt)}`)
      
      const reply = res.data.response || res.data.message || 'No response received from the AI.'
      await sock.sendMessage(jid, { text: reply })

    } catch (error) {
      throw new Error('The AI service is currently unavailable. Please try again later.')
    }
  }
}
