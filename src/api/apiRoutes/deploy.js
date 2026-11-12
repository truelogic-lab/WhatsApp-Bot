'use strict'

const express = require('express')
const supabase = require('../supabase')
const deployRouter = express.Router()

deployRouter.post('/', async (req, res) => {
  const { phone, server } = req.body

  if (!phone) {
    return res.status(400).json({ error: 'Phone number is required.' })
  }

  try {
    // 1. Insert a new bot into the database
    const { data: bot, error } = await supabase
      .from('bots')
      .insert({
        name: `Bot-${phone.slice(-4)}`,
        phone: phone,
        status: 'deploying'
      })
      .select()
      .single()

    if (error) throw error

    // 2. Respond with the bot ID so the engine can pick it up
    res.json({ 
      message: 'Bot deployment started', 
      botId: bot.id,
      code: 'Generating...' // The engine will update this
    })

  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = deployRouter
