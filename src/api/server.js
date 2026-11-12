'use strict'

const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const morgan = require('morgan')
const logger = require('../utils/logger')

// Import API Routes
const authRoutes = require('./apiRoutes/auth')
const userRoutes = require('./apiRoutes/user')
const paymentRoutes = require('./apiRoutes/payments')
const deployRoutes = require('./apiRoutes/deploy')

const app = express()

// Middleware
app.use(helmet())
app.use(cors())
app.use(express.json())
app.use(morgan('dev'))

// Mount Routes
app.use('/api/auth', authRoutes)
app.use('/api/user', userRoutes)
app.use('/api/payments', paymentRoutes)
app.use('/api/bots/deploy', deployRoutes) // <-- Added Deploy Route

// Health Check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'Warren-XMD SaaS Engine', time: new Date() })
})

// Start Server
function startAPI(port = process.env.PORT || 3000) {
  app.listen(port, () => {
    logger.info(`🚀 Warren-XMD API Server running on port ${port}`)
  })
}

module.exports = { startAPI, app }
