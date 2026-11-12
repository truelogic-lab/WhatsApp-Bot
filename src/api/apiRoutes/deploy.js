'use strict'

const express = require('express')
const supabase = require('../supabase')
const deployRouter = express.Router()

// 1. INITIATE DEPLOY
deployRouter.post('/', async (req, res) => {
  const { phone } = req.body

  if (!phone) {
    return res.status(400).json({ error: 'Phone number is required.' })
  }

  try {
    const cleanPhone = phone.replace(/\D/g, '')
    
    const { data: bot, error } = await supabase
      .from('bots')
      .insert({
        name: `Bot-${cleanPhone.slice(-4)}`,
        phone: cleanPhone,
        status: 'deploying',
        pairing_code: 'Generating...'
      })
      .select()
      .single()

    if (error) throw error

    res.json({ 
      message: 'Bot deployment started', 
      botId: bot.id 
    })

  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// 2. POLL FOR PAIRING CODE
deployRouter.get('/:id', async (req, res) => {
  try {
    const { data: bot, error } = await supabase
      .from('bots')
      .select('id, status, pairing_code')
      .eq('id', req.params.id)
      .single()
      
    if (error) throw error
    res.json(bot)
  } catch (err) {
    res.status(404).json({ error: 'Bot not found' })
  }
})

module.exports = deployRouter
