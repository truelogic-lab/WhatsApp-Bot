'use strict'

const axios = require('axios')

module.exports = {
  name: 'weather',
  permission: 'public',
  execute: async ({ sock, jid, args, config }) => {
    const city = args.join(' ')
    
    if (!city) {
      return sock.sendMessage(jid, { text: `Provide a city name.\n\nUsage:\n${config.prefix}weather Nairobi` })
    }

    await sock.sendMessage(jid, { text: 'Checking weather...' })

    try {
      // Using popcat's weather API
      const res = await axios.get(`https://api.popcat.xyz/weather?q=${encodeURIComponent(city)}`)
      const data = res.data[0]

      if (!data) throw new Error('City not found')

      const weatherText = `📍 *${data.location.name}, ${data.location.country}*\n\n` +
        `🌡️ *Temperature:* ${data.current.temp_c}°C\n` +
        `☁️ *Condition:* ${data.current.condition.text}\n` +
        `💨 *Wind:* ${data.current.wind_kph} kph\n` +
        `💧 *Humidity:* ${data.current.humidity}%`

      await sock.sendMessage(jid, { text: weatherText })

    } catch (error) {
      throw new Error('Could not fetch weather data. Ensure the city name is correct.')
    }
  }
}
