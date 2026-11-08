'use strict'

const axios = require('axios')
const { formatFooter } = require('../../utils/branding')

module.exports = {
  name: 'ssweb',
  permission: 'public',
  execute: async ({ sock, jid, args, config }) => {
    const url = args[0]
    if (!url || (!url.startsWith('http') && !url.includes('.'))) {
      return sock.sendMessage(jid, { text: `📌 *Usᴀɢᴇ:* ${config.prefix}ssweb <url>` })
    }

    const targetUrl = url.startsWith('http') ? url : `https://${url}`

    try {
      const apiUrl = `https://api.microlink.io/?url=${encodeURIComponent(targetUrl)}&screenshot=true&meta=false`
      const res = await axios.get(apiUrl)
      const screenshotUrl = res.data?.data?.screenshot?.url

      if (!screenshotUrl) throw new Error('No screenshot URL returned')

      const imageRes = await axios.get(screenshotUrl, { responseType: 'arraybuffer' })
      const buffer = Buffer.from(imageRes.data, 'binary')
      
      const caption = `🌐 *Screenshot:* ${targetUrl}${formatFooter()}`
      
      await sock.sendMessage(jid, { image: buffer, caption })
      
    } catch (error) {
      throw new Error('Failed to capture screenshot.')
    }
  }
}
