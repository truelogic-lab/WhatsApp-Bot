'use strict'

const express = require('express')
const supabase = require('../supabase')
const userRouter = express.Router()

// Middleware to verify Supabase JWT
const verifyToken = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1]
  if (!token) return res.status(401).json({ error: 'No token provided' })

  const { data: { user }, error } = await supabase.auth.getUser(token)
  if (error || !user) return res.status(401).json({ error: 'Invalid token' })

  req.user = user
  next()
}

userRouter.get('/me', verifyToken, async (req, res) => {
  try {
    // Get profile, balance, and active plan in one go
    const { data: profile } = await supabase.from('profiles').select('*').eq('id', req.user.id).single()
    const { data: balance } = await supabase.from('user_token_balances').select('balance').eq('user_id', req.user.id).single()
    const { data: sub } = await supabase.from('subscriptions').select('*, plans(*)').eq('user_id', req.user.id).eq('status', 'active').single()

    res.json({
      profile,
      balance: balance?.balance || 0,
      subscription: sub || null
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

module.exports = userRouter
