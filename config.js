'use strict'

require('dotenv').config()

const config = {
  botName: 'Warren-XMD',
  version: '1.0.0',
  
  // Owner details are now securely hardcoded inside commands
  
  prefix: '.',
  timezone: 'Africa/Nairobi',
  sessionDir: './data/session',
  
  settings: {
    mode: 'public',
    autoStatus: false,
    autoReact: false,
    autoTyping: true,
    alwaysOnline: true,
    statusReact: false,
    antiDelete: false,
    antiLink: 'kick',
    antiStatusMention: false,
    antiCall: false
  }
}

module.exports = config
