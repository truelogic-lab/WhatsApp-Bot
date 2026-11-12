'use strict'

const supabase = require('../api/supabase')
const { connectToWhatsApp } = require('./connection')
const logger = require('../utils/logger')

const activeBots = new Map()

async function syncBots() {
  try {
    const { data: bots, error } = await supabase
      .from('bots')
      .select('*')
      .eq('status', 'deploying') // ONLY look for 'deploying'

    if (error) throw error

    for (const bot of bots) {
      if (!activeBots.has(bot.id)) {
        
        // Mark as 'starting' IMMEDIATELY
        await supabase.from('bots').update({ status: 'starting' }).eq('id', bot.id)
        
        logger.info(`🚀 Spinning up bot: ${bot.name} (${bot.id})`)
        
        const sock = await connectToWhatsApp(bot.id, bot.phone)
        activeBots.set(bot.id, { sock, userId: bot.user_id })
      }
    }
  } catch (err) {
    logger.error('Bot Manager Sync Error: ' + err.message)
  }
}

function startBotManager() {
  setInterval(syncBots, 5000)
  logger.info('🤖 Bot Deployment Engine started.')
}

module.exports = { startBotManager, activeBots }
