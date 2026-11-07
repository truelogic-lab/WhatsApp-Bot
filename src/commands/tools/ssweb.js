'use strict'

const axios = require('axios')

module.exports = {
  name: 'ssweb',
  permission: 'public',
  execute: async ({ sock, jid, args, config }) => {
    const url = args[0]
    if (!url || (!url.startsWith('http') && !url.includes('.'))) {
      return sock.sendMessage(jid, { text: `📌 *Usᴀɢᴇ:* ${config.prefix}ssweb <url>\nExample: ${config.prefix}ssweb google.com` })
    }

    const targetUrl = url.startsWith('http') ? url : `https://${url}`

    try {
      // Using Microlink API (Generous free tier, real headless browser)
      const apiUrl = `https://api.microlink.io/?url=${encodeURIComponent(targetUrl)}&screenshot=true&meta=false`
      
      const res = await axios.get(apiUrl)
      const screenshotUrl = res.data?.data?.screenshot?.url

      if (!screenshotUrl) {
        throw new Error('No screenshot URL returned')
      }

      // Download the image buffer and send it
      const imageRes = await axios.get(screenshotUrl, { responseType: 'arraybuffer' })
      const buffer = Buffer.from(imageRes.data, 'binary')
      
      await sock.sendMessage(jid, { 
        image: buffer, 
        caption: `🌐 *Screenshot of:* ${targetUrl}` 
      })
      
    } catch (error) {
      throw new Error('Failed to capture screenshot. The site might be blocking bots or taking too long.')
    }
  }
}
