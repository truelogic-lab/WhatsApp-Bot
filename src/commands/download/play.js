'use strict'

const yts = require('yt-search')
const { exec } = require('child_process')
const fs = require('fs')
const path = require('path')
const logger = require('../../utils/logger')
const { formatFooter } = require('../../utils/branding')

module.exports = {
  name: 'play',
  permission: 'public',
  execute: async ({ sock, jid, args, config }) => {
    const query = args.join(' ')
    if (!query) {
      return sock.sendMessage(jid, { text: `Provide a song name.\n\nUsage:\n${config.prefix}play Faded` })
    }

    try {
      // 1. Search YouTube
      const search = await yts(query)
      const video = search.videos[0]
      if (!video) throw new Error('No results found')

      // 2. Professional Found Message with Footer
      const foundText = `╭━━━━━━〔 🎵 ᴀᴜᴅɪᴏ sᴇᴀʀᴄʜ 〕━━━━━━
│ ◉ ᴛɪᴛʟᴇ: ${video.title}
│ ◉ ᴅᴜʀᴀᴛɪᴏɴ: ${video.timestamp}
│ ◉ ᴀᴜᴛʜᴏʀ: ${video.author.name}
╰━━━━━━━━━━━━━━━━━━━━━━━${formatFooter()}`

      await sock.sendMessage(jid, { 
        image: { url: video.thumbnail }, 
        caption: foundText 
      })

      // 3. Setup temporary file path
      const tempFileName = `audio_${Date.now()}.mp3`
      const tempFilePath = path.join(__dirname, `../../${tempFileName}`)

      // 4. Use yt-dlp to download
      const ytdlpCommand = `yt-dlp -x --audio-format mp3 --no-playlist -o "${tempFilePath}" "${video.url}"`

      await new Promise((resolve, reject) => {
        exec(ytdlpCommand, (error, stdout, stderr) => {
          if (error) {
            logger.error(`yt-dlp error: ${stderr || error.message}`)
            reject(new Error('Failed to download audio.'))
            return
          }
          resolve()
        })
      })

      if (!fs.existsSync(tempFilePath)) {
        throw new Error('Downloaded file not found.')
      }

      // 5. Send the audio file
      await sock.sendMessage(jid, { 
        audio: fs.readFileSync(tempFilePath), 
        mimetype: 'audio/mp4',
        fileName: `${video.title}.mp3`
      })

      // 6. Clean up
      fs.unlinkSync(tempFilePath)

    } catch (error) {
      logger.error(`Play command error: ${error.message}`)
      throw new Error('Failed to download the audio. The video may be restricted or the API is down.')
    }
  }
}
