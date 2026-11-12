'use strict'

const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const morgan = require('morgan')
const logger = require('../utils/logger')

const authRoutes = require('./apiRoutes/auth')
const userRoutes = require('./apiRoutes/user')
const paymentRoutes = require('./apiRoutes/payments')
const deployRoutes = require('./apiRoutes/deploy')
const engineRoutes = require('./apiRoutes/engine')

const app = express()

app.use(helmet())
app.use(cors())
app.use(express.json())
app.use(morgan('dev'))

app.use('/api/auth', authRoutes)
app.use('/api/user', userRoutes)
app.use('/api/payments', paymentRoutes)
app.use('/api/bots/deploy', deployRoutes)
app.use('/api/bots/engine', engineRoutes) // Mount the engine routes

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'Warren-XMD SaaS Engine', time: new Date() })
})

function startAPI(port = process.env.PORT || 3000) {
  app.listen(port, () => {
    logger.info(`🚀 Warren-XMD API Server running on port ${port}`)
  })
}

module.exports = { startAPI, app }
