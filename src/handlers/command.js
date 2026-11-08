'use strict'

const { getCommand } = require('./loader')
const { checkPermission } = require('./permissions')
const config = require('../../config')
const logger = require('../utils/logger')

async function handleCommand(context) {
  const { sock, msg, commandName, args, startTime } = context
  const jid = msg.key.remoteJid

  const command = getCommand(commandName)
  if (!command) return

  const perm = await checkPermission(sock, msg, command)
  
  if (!perm.allowed) {
    if (perm.reason === 'private_mode' || perm.reason === 'inbox_mode') return
    let denialMsg = 'You do not have permission to run this command.'
    if (perm.reason === 'owner_only') denialMsg = 'This command is restricted to the bot owner.'
    if (perm.reason === 'admin_only') denialMsg = 'This command is restricted to group admins.'
    return sock.sendMessage(jid, { text: denialMsg })
  }

  try {

    await sock.sendMessage(jid, { react: { text: '⏳', key: msg.key } }).catch(() => {})

    if (config.settings.autoTyping) {
      await sock.sendPresenceUpdate('composing', jid)
    }

    // Add a 15-second timeout to prevent infinite hanging on broken APIs
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Command timed out after 15 seconds.')), 15000)
    )

    // Race the command against the timeout
    await Promise.race([
      command.execute({ sock, msg, args, config, startTime, jid, commandName }),
      timeoutPromise
    ])

    // React with Checkmark (✅)
    await sock.sendMessage(jid, { react: { text: '✅', key: msg.key } }).catch(() => {})

  } catch (error) {
    logger.error(`Error executing command [${commandName}]: ${error.message}`)
    
    // React with Cross (❌)
    await sock.sendMessage(jid, { react: { text: '❌', key: msg.key } }).catch(() => {})
    
    // Send a clean, professional error message
    let userFriendlyError = 'Unable to complete the request right now. Please try again later.'
    if (error.message.includes('timed out')) {
      userFriendlyError = 'The server took too long to respond. The service might be down or busy.'
    } else if (error.message.includes('rate limit')) {
      userFriendlyError = 'The service is currently rate-limited. Please try again in a few minutes.'
    }

    await sock.sendMessage(jid, { text: `❌ ${userFriendlyError}` })
    
  } finally {
    if (config.settings.autoTyping) {
      await sock.sendPresenceUpdate('paused', jid)
    }
  }
}

module.exports = { handleCommand }
