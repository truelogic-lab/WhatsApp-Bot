'use strict'

const { exec } = require('child_process')
const logger = require('../../utils/logger')

module.exports = {
  name: 'update',
  permission: 'owner',
  execute: async ({ sock, jid, args, msg }) => {
    const commitMessage = args.join(' ') || 'Auto-update from WhatsApp bot'

    await sock.sendMessage(jid, { text: '🚀 Pushing updates to GitHub...' })

    // Command to add all files, commit, and push
    const gitCommand = `git add . && git commit -m "${commitMessage}" && git push origin main`

    exec(gitCommand, (error, stdout, stderr) => {
      if (error) {
        // If there's an error (e.g., no changes to commit, or no internet)
        logger.error(`Git update failed: ${error.message}`)
        
        // Send the error details to the owner so they know what happened
        let errorMsg = '❌ *Update Failed*\n\n'
        if (stderr.includes('nothing to commit')) {
          errorMsg = 'ℹ️ *No Changes*\n\nThere are no new changes to commit. The repository is up to date.'
        } else {
          errorMsg += `\`\`\`${stderr || error.message}\`\`\``
        }
        
        return sock.sendMessage(jid, { text: errorMsg })
      }

      // Success
      logger.info('Git update successful.')
      sock.sendMessage(jid, { 
        text: `✅ *GitHub Updated Successfully*\n\n📝 *Commit:* ${commitMessage}\n\n\`\`\`${stdout}\`\`\`` 
      })
    })
  }
}
