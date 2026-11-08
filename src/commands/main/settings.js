'use strict'

module.exports = {
  name: 'settings',
  permission: 'owner',
  execute: async ({ sock, jid, config, startTime }) => {
    const speed = Date.now() - startTime

    const settingsText = `✨ *Change your bot's settings*
🎨 Give your bot a new identity!

🛠️ *AVAILABLE SETTINGS COMMANDS*
🔹 ${config.prefix}botname
🔹 ${config.prefix}description
🔹 ${config.prefix}botdp (Menu Image)
🔹 ${config.prefix}setdp (Profile Picture)
🔹 ${config.prefix}mode

👑 *MAKE IT YOUR OWN!*
💚 Change the bot name
📝 Update the bot description
🖼️ Set a new menu image (botdp)
📸 Set a new WhatsApp DP (setdp)
🔒 Change the bot mode

🚀 You can customize your bot
✨ Replace the name
💫 Add your own preferred name!

> *⚡ Warren-ᴍᴅ ꜱᴘᴇᴇᴅ: ${speed}ᴍꜱ 🔥*`

    await sock.sendMessage(jid, { text: settingsText })
  }
}
