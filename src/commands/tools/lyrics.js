'use strict'

const axios = require('axios')

module.exports = {
  name: 'lyrics',
  permission: 'public',
  execute: async ({ sock, jid, args, config }) => {
    const song = args.join(' ')
    
    if (!song) {
      return sock.sendMessage(jid, { text: `Provide a song name.\n\nUsage:\n${config.prefix}lyrics Shape of You` })
    }

    await sock.sendMessage(jid, { text: 'Searching for lyrics...' })

    try {
      const res = await axios.get(`https://api.popcat.xyz/lyrics?song=${encodeURIComponent(song)}`)
      const data = res.data

      if (!data.lyrics) throw new Error('Lyrics not found')

      const lyricsText = `🎵 *${data.title}* by *${data.artist}*\n\n${data.lyrics}`
      
      // If there's an album art, send it with the lyrics
      if (data.image) {
        await sock.sendMessage(jid, { image: { url: data.image }, caption: lyricsText })
      } else {
        await sock.sendMessage(jid, { text: lyricsText })
      }

    } catch (error) {
      throw new Error('Could not find lyrics for this song.')
    }
  }
}
