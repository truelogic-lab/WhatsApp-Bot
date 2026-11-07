'use strict'

const { updateSetting, loadDB, saveDB } = require('../../utils/database')

module.exports = {
  name: 'autobio',
  permission: 'owner',
  execute: async ({ sock, jid, args, config }) => {
    const action = args[0]?.toLowerCase()

    if (action === 'set') {
      const newBio = args.slice(1).join(' ')
      if (!newBio) return sock.sendMessage(jid, { text: 'Provide the text for the new bio.' })

      try {
        await sock.updateProfileStatus(newBio)
        
        // Save to DB
        const db = loadDB()
        db.autoBio = newBio
        saveDB(db)

        await sock.sendMessage(jid, { text: `✅ Bot bio updated to:\n"${newBio}"` })
      } catch (error) {
        throw new Error('Failed to update bio on WhatsApp.')
      }
    } else {
      const db = loadDB()
      const currentBio = db.autoBio || 'Not set'
      await sock.sendMessage(jid, { 
        text: `📌 *Usᴀɢᴇ:* ${config.prefix}autobio set <text>\n*Cᴜʀʀᴇɴᴛ ʙɪᴏ:* ${currentBio}` 
      })
    }
  }
}
