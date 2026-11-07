'use strict'

module.exports = {
  name: 'getdp',
  permission: 'public',
  execute: async ({ sock, jid, args, config }) => {
    const input = args[0]

    if (!input) {
      return sock.sendMessage(jid, { 
        text: `Provide a phone number with the country code.\n\nUsage:\n${config.prefix}getdp 254712345678` 
      })
    }

    // Global Number Cleaning:
    // 1. Remove all non-digits
    // 2. Handle numbers starting with '00' (e.g. 0044...) and remove the '00'
    // 3. Handle numbers starting with '0' (e.g. 0712...) and strip the leading zero
    let cleanNumber = input.replace(/[^0-9]/g, '')
    if (cleanNumber.startsWith('00')) {
      cleanNumber = cleanNumber.substring(2)
    } else if (cleanNumber.startsWith('0')) {
      cleanNumber = cleanNumber.substring(1)
    }

    // Construct the WhatsApp JID
    const targetJid = `${cleanNumber}@s.whatsapp.net`

    try {
      // Request the high-resolution profile picture
      const ppUrl = await sock.profilePictureUrl(targetJid, 'image')
      
      if (!ppUrl) {
        return sock.sendMessage(jid, { text: 'This user does not have a profile picture.' })
      }

      // Download the image buffer to send it directly (prevents broken link errors)
      const response = await fetch(ppUrl)
      const arrayBuffer = await response.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)

      await sock.sendMessage(jid, { 
        image: buffer, 
        caption: `Profile picture for +${cleanNumber}` 
      })

    } catch (error) {
      // If the number isn't on WhatsApp, or the DP is hidden by privacy settings
      await sock.sendMessage(jid, { 
        text: 'Unable to retrieve the profile picture. The number may not be on WhatsApp, or their privacy settings block it.' 
      })
    }
  }
}
