'use strict'

const express = require('express')
const supabase = require('../supabase')
const engineRouter = express.Router()

// Middleware to check the secret
const verifySecret = (req, res, next) => {
  const secret = req.headers['x-engine-secret']
  if (!secret || secret !== process.env.ENGINE_API_SECRET) {
    return res.status(401).json({ error: 'Unauthorized: Invalid engine secret' })
  }
  next()
}

engineRouter.use(verifySecret)

// 1. Bot reports its pairing code
engineRouter.post('/:id/pairing-code', async (req, res) => {
  const { id } = req.params
  const { code } = req.body

  try {
    const { error } = await supabase
      .from('bots')
      .update({ pairing_code: code })
      .eq('id', id)

    if (error) throw error
    res.json({ success: true, message: 'Pairing code saved' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// 2. Bot reports its status
engineRouter.post('/:id/status', async (req, res) => {
  const { id } = req.params
  const { status, lastError } = req.body

  try {
    const { error } = await supabase
      .from('bots')
      .update({ 
        status: status,
        last_error: lastError || null
      })
      .eq('id', id)

    if (error) throw error
    res.json({ success: true, message: 'Status updated' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// 3. Get pending bots for the engine to spin up
engineRouter.get('/pending', async (req, res) => {
  try {
    const { data: bots, error } = await supabase
      .from('bots')
      .select('*')
      .eq('status', 'deploying')

    if (error) throw error
    res.json({ bots: bots || [] })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = engineRouter
