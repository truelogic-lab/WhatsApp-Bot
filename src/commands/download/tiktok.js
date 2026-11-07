'use strict'

const axios = require('axios')

module.exports = {
  name: 'tiktok',
  permission: 'public',
  execute: async ({ sock, jid, args, config }) => {
    const url = args[0]
    if (!url || !url.includes('tiktok.com')) {
      return sock.sendMessage(jid, { text: `Provide a valid TikTok link.\n\nUsage:\n${config.prefix}tiktok https://vm.tiktok.com/...` })
    }

    await sock.sendMessage(jid, { text: 'Downloading video...' })

    try {
      // Using a stable public API
      const res = await axios.get(`https://api.tiklydown.eu.org/api/download?url=${url}`)
      const data = res.data
      
      if (!data.video || !data.video.noWatermark) {
        throw new Error('Failed to parse video URL')
      }

      await sock.sendMessage(jid, {
        video: { url: data.video.noWatermark },
        caption: `*${data.title || 'TikTok Video'}*`
      })
    } catch (error) {
      throw new Error('Failed to download the TikTok video. Ensure the link is public.')
    }
  }
}
