'use strict'

const axios = require('axios')

module.exports = {
  name: 'img',
  permission: 'public',
  aliases: ['image', 'gimage'],
  execute: async ({ sock, jid, args, config }) => {
    const query = args.join(' ')
    if (!query) return sock.sendMessage(jid, { text: `Provide a search term.\n\nUsage:\n${config.prefix}img Nairobi skyline` })

    await sock.sendMessage(jid, { text: 'Searching for images...' })

    try {
      const res = await axios.get(`https://api.vreden.my.id/api/gimage?query=${encodeURIComponent(query)}`)
      const images = res.data.result

      if (!images || images.length === 0) throw new Error('No images found')

      // Send the first 3 images
      for (let i = 0; i < Math.min(3, images.length); i++) {
        await sock.sendMessage(jid, { 
          image: { url: images[i].url }, 
          caption: `Result ${i + 1} for: ${query}` 
        })
      }
    } catch (error) {
      throw new Error('Failed to find images. Please try a different search.')
    }
  }
}
