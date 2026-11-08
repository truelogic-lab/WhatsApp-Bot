'use strict'

const axios = require('axios')
const fs = require('fs')
const path = require('path')
const { exec } = require('child_process')
const logger = require('../../utils/logger')

const getTtsBaseUrl = () => Buffer.from(process.env.TTS_API_URL || 'aHR0cHM6Ly90cmFuc2xhdGUuZ29vZ2xlLmNvbS90cmFuc2xhdGVfdHRz', 'base64').toString('utf-8')

module.exports = {
  name: 'tts',
  permission: 'public',
  aliases: ['say', 'voice'],
  execute: async ({ sock, jid, args, config }) => {
    const text = args.join(' ')

    if (!text) {
      return sock.sendMessage(jid, { 
        text: `📌 *Usᴀɢᴇ:* ${config.prefix}tts <text>\n*Example:* ${config.prefix}tts Hello my love!` 
      })
    }

    // Increased limit to 500 characters
    if (text.length > 500) {
      return sock.sendMessage(jid, { text: '❌ Text is too long. Maximum is 500 characters.' })
    }

    try {
      const baseUrl = getTtsBaseUrl()
      const url = `${baseUrl}?ie=UTF-8&q=${encodeURIComponent(text)}&tl=en&client=tw-ob`
      
      // 1. Download MP3
      const res = await axios.get(url, { responseType: 'arraybuffer' })
      
      const tempMp3 = path.join(__dirname, `../../temp_${Date.now()}.mp3`)
      const tempOgg = path.join(__dirname, `../../temp_${Date.now()}.ogg`)
      
      fs.writeFileSync(tempMp3, Buffer.from(res.data, 'binary'))

      // 2. Convert to OGG/Opus using ffmpeg (Required for WhatsApp Voice Notes)
      const ffmpegCmd = `ffmpeg -i "${tempMp3}" -c:a libopus -b:a 64k -vbr on -compression_level 10 "${tempOgg}"`
      
      await new Promise((resolve, reject) => {
        exec(ffmpegCmd, (error) => {
          if (error) reject(error)
          else resolve()
        })
      })

      // 3. Send the Voice Note
      await sock.sendMessage(jid, { 
        audio: fs.readFileSync(tempOgg), 
        mimetype: 'audio/ogg; codecs=opus',
        ptt: true 
      })

      // 4. Cleanup
      if (fs.existsSync(tempMp3)) fs.unlinkSync(tempMp3)
      if (fs.existsSync(tempOgg)) fs.unlinkSync(tempOgg)

    } catch (error) {
      logger.error(`TTS error: ${error.message}`)
      throw new Error('Failed to generate voice note.')
    }
  }
}
