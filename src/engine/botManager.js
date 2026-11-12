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
      .in('status', ['deploying', 'online'])

    if (error) throw error

    for (const bot of bots) {
      if (!activeBots.has(bot.id)) {
        logger.info(`🚀 Spinning up bot: ${bot.name} (${bot.id})`)

        // Mark as deploying (was 'online' before)
        if (bot.status === 'online') {
          await supabase.from('bots').update({ status: 'deploying' }).eq('id', bot.id)
        }

        // ⭐ Pass bot.phone as third argument
        const sock = await connectToWhatsApp(bot.id, bot.session_data, bot.phone)

        activeBots.set(bot.id, { sock, userId: bot.user_id })

        // ⭐ DO NOT set status to 'online' here.
        // connection.js will set it when WhatsApp actually pairs.
      }
    }

    // Clean up removed/suspended bots
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

function startBotManager() {
  setInterval(syncBots, 10000)
  logger.info('🤖 Bot Deployment Engine started.')
}

module.exports = { startBotManager, activeBots }
