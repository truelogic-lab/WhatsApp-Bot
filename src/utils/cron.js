'use strict'

const logger = require('./logger')
const { loadDB } = require('./database')

function startCronJobs(sock) {
  // 1. Auto-Bio Sync (every 30 mins)
  setInterval(async () => {
    const db = loadDB()
    if (db.autoBio) {
      try { await sock.updateProfileStatus(db.autoBio) } catch (err) {}
    }
  }, 1800000)

  // 2. Dynamic Morning Message Check (runs every minute)
  let lastSentDate = ''
  setInterval(async () => {
    const db = loadDB()
    if (!db.morningConfig) return

    const now = new Date()
    const formatter = new Intl.DateTimeFormat('en-GB', { timeZone: 'Africa/Nairobi', hour: '2-digit', minute: '2-digit', hour12: false })
    const currentTime = formatter.format(now)
    const currentDate = now.toLocaleDateString('en-GB', { timeZone: 'Africa/Nairobi' })
    const trackingId = `${currentDate}-${currentTime}`

    if (currentTime === db.morningConfig.time && lastSentDate !== trackingId) {
      lastSentDate = trackingId 
      try {
        await sock.sendMessage(`${db.morningConfig.number}@s.whatsapp.net`, { text: db.morningConfig.message })
        logger.info(`✅ Morning message sent to ${db.morningConfig.number}`)
      } catch (err) {}
    }
  }, 60000)

  // 3. Birthday Checker (Runs every minute, triggers at 9:00 AM)
  let lastBirthdayDate = ''
  setInterval(async () => {
    const db = loadDB()
    if (!db.birthdays || db.birthdays.length === 0) return

    const now = new Date()
    const timeFormatter = new Intl.DateTimeFormat('en-GB', { timeZone: 'Africa/Nairobi', hour: '2-digit', minute: '2-digit', hour12: false })
    const dateFormatter = new Intl.DateTimeFormat('en-GB', { timeZone: 'Africa/Nairobi', day: '2-digit', month: '2-digit', year: 'numeric' })
    
    const currentTime = timeFormatter.format(now)
    const currentDate = dateFormatter.format(now) // Outputs DD/MM/YYYY
    
    // We only trigger at 09:00 AM
    if (currentTime === '09:00' && lastBirthdayDate !== currentDate) {
      
      // Extract DD/MM for comparison
      const parts = currentDate.split('/')
      const todayDDMM = `${parts[0]}/${parts[1]}`

      for (const bday of db.birthdays) {
        if (bday.date === todayDDMM) {
          try {
            await sock.sendMessage(`${bday.number}@s.whatsapp.net`, { text: bday.message })
            logger.info(`🎂 Birthday message sent to ${bday.number}`)
            // Delay to prevent spam block
            await new Promise(r => setTimeout(r, 3000))
          } catch (err) {
            logger.error(`Failed to send birthday message: ${err.message}`)
          }
        }
      }
      lastBirthdayDate = currentDate
    }
  }, 60000)
}

module.exports = { startCronJobs }
