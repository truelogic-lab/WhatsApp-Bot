'use strict'

const logger = require('../../utils/logger')
const { formatFooter } = require('../../utils/branding')

// Hidden API Decoder
const getApiUrl = () => Buffer.from(process.env.IMAGE_API_URL || '', 'base64').toString('utf-8')
const getApiParams = () => Buffer.from(process.env.IMAGE_API_PARAMS || '', 'base64').toString('utf-8')
const getApiSuffix = () => Buffer.from(process.env.IMAGE_API_SUFFIX || '', 'base64').toString('utf-8')

module.exports = {
  name: 'imagine',
  permission: 'public',
  aliases: ['flux', 'draw', 'generate'],
  execute: async ({ sock, jid, args, config }) => {
    const prompt = args.join(' ')

    if (!prompt) {
      return sock.sendMessage(jid, { 
        text: `📌 *Usᴀɢᴇ:* ${config.prefix}imagine <prompt>\n*Example:* ${config.prefix}imagine a cyberpunk city at night` 
      })
    }

    try {
      // 1. Build the URL using the hidden variables
      const encodedPrompt = encodeURIComponent(prompt)
      const baseUrl = getApiUrl()
      const paramPath = getApiParams()
      const suffix = getApiSuffix()

      if (!baseUrl || !paramPath) {
        throw new Error('API configuration missing.')
      }

      // 2. Generate the image URL
      const imageUrl = `${baseUrl}${paramPath}${encodedPrompt}${suffix}`

      // 3. Send the image
      const caption = `🎨 *Prompt:* ${prompt}${formatFooter()}`
      
      await sock.sendMessage(jid, { 
        image: { url: imageUrl }, 
        caption 
      })

    } catch (error) {
      logger.error(`Imagine command error: ${error.message}`)
      throw new Error('Failed to generate the image. Please try a different prompt.')
    }
  }
}
