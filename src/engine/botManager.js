'use strict'

const supabase = require('../api/supabase')
const { connectToWhatsApp } = require('./connection')
const logger = require('../utils/logger')

// A map to keep track of all active bot sockets
const activeBots = new Map()

async function syncBots() {
  try {
    // 1. Find bots that are 'deploying' or 'online'
    const { data: bots, error } = await supabase
      .from('bots')
      .select('*')
      .in('status', ['deploying', 'online'])

    if (error) throw error

    for (const bot of bots) {
      // If the bot is not in memory, we need to start it
      if (!activeBots.has(bot.id)) {
        logger.info(`🚀 Spinning up bot: ${bot.name} (${bot.id})`)
        
        // Mark as deploying in DB
        if (bot.status === 'online') {
          await supabase.from('bots').update({ status: 'deploying' }).eq('id', bot.id)
        }

        // Start the Baileys connection
        // We pass the bot ID so the session and router know which user it belongs to
        const sock = await connectToWhatsApp(bot.id, bot.session_data)
        
        activeBots.set(bot.id, { sock, userId: bot.user_id })

        // Once connected, update DB to online
        await supabase.from('bots').update({ 
          status: 'online', 
          last_seen_at: new Date().toISOString() 
        }).eq('id', bot.id)
      }
    }

    // 2. Check for bots that were deleted or suspended
    for (const [botId, botData] of activeBots.entries()) {
      const dbBot = bots.find(b => b.id === botId)
      if (!dbBot || dbBot.status === 'suspended') {
        logger.info(`🛑 Stopping bot: ${botId}`)
        await botData.sock.end(undefined)
        activeBots.delete(botId)
      }
    }

  } catch (err) {
    logger.error('Bot Manager Sync Error: ' + err.message)
  }
}

// Run sync every 10 seconds
function startBotManager() {
  setInterval(syncBots, 10000)
  logger.info('🤖 Bot Deployment Engine started.')
}

module.exports = { startBotManager, activeBots }
