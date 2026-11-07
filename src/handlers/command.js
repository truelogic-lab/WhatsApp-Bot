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
    // 1. React with Hourglass (⏳) to show processing
    await sock.sendMessage(jid, { react: { text: '⏳', key: msg.key } }).catch(() => {})

    if (config.settings.autoTyping) {
      await sock.sendPresenceUpdate('composing', jid)
    }

    // 2. Execute the command
    await command.execute({
      sock,
      msg,
      args,
      config,
      startTime,
      jid,
      commandName
    })

    // 3. React with Checkmark (✅) on success
    await sock.sendMessage(jid, { react: { text: '✅', key: msg.key } }).catch(() => {})

  } catch (error) {
    logger.error(`Error executing command [${commandName}]: ${error.message}`)
    
    // 4. React with Cross (❌) on failure
    await sock.sendMessage(jid, { react: { text: '❌', key: msg.key } }).catch(() => {})
    await sock.sendMessage(jid, { text: 'Unable to complete the request. Please try again later.' })
    
  } finally {
    if (config.settings.autoTyping) {
      await sock.sendPresenceUpdate('paused', jid)
    }
  }
}

module.exports = { handleCommand }
