'use strict'

const axios = require('axios')

module.exports = {
  name: 'instagram',
  permission: 'public',
  execute: async ({ sock, jid, args, config }) => {
    const url = args[0]
    if (!url || !url.includes('instagram.com')) {
      return sock.sendMessage(jid, { text: `Provide a valid Instagram link.\n\nUsage:\n${config.prefix}instagram https://www.instagram.com/reel/...` })
    }

    await sock.sendMessage(jid, { text: 'Downloading media...' })

    try {
      // Using a public API
      const res = await axios.get(`https://api.vreden.web.id/api/igdownload?url=${url}`)
      const result = res.data.result
      
      if (!result || result.length === 0) {
        throw new Error('Failed to parse media')
      }

      // Instagram posts can be images or videos
      const mediaUrl = result[0].url
      const isVideo = result[0].type === 'video'

      if (isVideo) {
        await sock.sendMessage(jid, {
          video: { url: mediaUrl },
          caption: 'Instagram Video'
        })
      } else {
        await sock.sendMessage(jid, {
          image: { url: mediaUrl },
          caption: 'Instagram Image'
        })
      }
    } catch (error) {
      throw new Error('Failed to download the Instagram media. Ensure the post is public.')
    }
  }
}
