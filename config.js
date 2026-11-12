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
    autoRead: false,
    recording: false,
    autoTyping: true,
    alwaysOnline: true,
    statusReact: false,
    antiDelete: false,
    antiEdit: false,
    reactEmojis: '👍,❤️,🔥,😂,😮',
    ownerEmojis: '👑,⭐,💎',
    antiLink: 'kick',
    antiStatusMention: false,
    antiCall: false,
    autoChannelReact: true
  }
}

module.exports = config
