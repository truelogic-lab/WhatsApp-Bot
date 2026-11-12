'use strict'

const express = require('express')
const supabase = require('../supabase')
const deployRouter = express.Router()

deployRouter.post('/', async (req, res) => {
  const { phone } = req.body

  if (!phone) {
    return res.status(400).json({ error: 'Phone number is required.' })
  }

  try {
    // 1. Insert a new bot into the database (user_id is now nullable)
    const { data: bot, error } = await supabase
      .from('bots')
      .insert({
        name: `Bot-${phone.slice(-4)}`,
        phone: phone,
        status: 'deploying'
        // We intentionally omit user_id for public deploys
      })
      .select()
      .single()

    if (error) {
      console.error('Supabase Insert Error:', error)
      return res.status(500).json({ error: error.message })
    }

    // 2. Respond with the bot ID so the engine can pick it up
    res.json({ 
      message: 'Bot deployment started', 
      botId: bot.id,
      code: 'Generating...'
    })

  } catch (err) {
    console.error('Deploy Route Error:', err)
    res.status(500).json({ error: err.message })
  }
})

module.exports = deployRouter
