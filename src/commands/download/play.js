'use strict'

const yts = require('yt-search')
const { exec } = require('child_process')
const fs = require('fs')
const path = require('path')
const logger = require('../../utils/logger')

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

      await sock.sendMessage(jid, { 
        image: { url: video.thumbnail }, 
        caption: `Found: *${video.title}*\nDuration: ${video.timestamp}\n\nDownloading audio...` 
      })

      // 2. Setup temporary file path
      const tempFileName = `audio_${Date.now()}.mp3`
      const tempFilePath = path.join(__dirname, `../../${tempFileName}`)

      // 3. Use yt-dlp to download and convert to mp3
      // -x: extract audio, --audio-format mp3: convert to mp3, --no-playlist: only download the single video
      const ytdlpCommand = `yt-dlp -x --audio-format mp3 --no-playlist -o "${tempFilePath}" "${video.url}"`

      await new Promise((resolve, reject) => {
        exec(ytdlpCommand, (error, stdout, stderr) => {
          if (error) {
            logger.error(`yt-dlp error: ${stderr || error.message}`)
            reject(new Error('yt-dlp failed to download the audio.'))
            return
          }
          resolve()
        })
      })

      // 4. Verify file exists
      if (!fs.existsSync(tempFilePath)) {
        throw new Error('Downloaded file not found.')
      }

      // 5. Send the audio file
      await sock.sendMessage(jid, { 
        audio: fs.readFileSync(tempFilePath), 
        mimetype: 'audio/mp4',
        fileName: `${video.title}.mp3`
      })

      // 6. Clean up: delete the file after sending
      fs.unlinkSync(tempFilePath)

    } catch (error) {
      logger.error(`Play command error: ${error.message}`)
      throw new Error('Failed to download the audio. The video may be restricted or the API is down.')
    }
  }
}
