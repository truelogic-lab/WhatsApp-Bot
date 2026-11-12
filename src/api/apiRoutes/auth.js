'use strict'

const express = require('express')
const supabase = require('../supabase')
const authRouter = express.Router()

authRouter.post('/register', async (req, res) => {
  const { email, password, full_name } = req.body

  try {
    // 1. Create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name }
    })

    if (authError) throw authError

    // The trigger we created in SQL automatically creates the profile.
    res.status(201).json({ message: 'User created successfully', user: authData.user })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

module.exports = authRouter
