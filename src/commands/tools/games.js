'use strict'

module.exports = {
  name: 'games',
  permission: 'public',
  aliases: ['8ball', 'truth', 'dare', 'rate', 'compatibility'],
  execute: async ({ sock, msg, jid, args, commandName, config, sender }) => {
    const quotedParticipant = msg.message.extendedTextMessage?.contextInfo?.participant

    // --- 8BALL ---
    if (commandName === '8ball') {
      const question = args.join(' ')
      if (!question) return sock.sendMessage(jid, { text: `Ask a question!\nExample: ${config.prefix}8ball Will I be rich?` })

      const responses = [
        'Yes, absolutely!', 'No doubt about it.', 'Without a doubt.', 'Definitely yes.',
        'You can rely on it.', 'Most likely.', 'Outlook good.', 'Yes.', 'Signs point to yes.',
        'Reply hazy, try again.', 'Ask again later.', 'Better not tell you now.', 'Cannot predict now.',
        'Don\'t count on it.', 'My reply is no.', 'My sources say no.', 'Outlook not so good.', 'Very doubtful.'
      ]
      const randomResponse = responses[Math.floor(Math.random() * responses.length)]
      
      return sock.sendMessage(jid, { 
        text: `🎱 *Question:* ${question}\n\n*Answer:* ${randomResponse}` 
      })
    }

    // --- TRUTH ---
    if (commandName === 'truth') {
      const truths = [
        'What is your biggest fear?',
        'What is the most embarrassing thing you have ever done?',
        'Who was your first crush?',
        'What is a secret you have never told anyone?',
        'What is the worst lie you have ever told?',
        'What is your biggest regret?',
        'Have you ever cheated on a test?',
        'What is the most childish thing you still do?'
      ]
      const randomTruth = truths[Math.floor(Math.random() * truths.length)]
      return sock.sendMessage(jid, { text: `🤫 *TRUTH:*\n\n${randomTruth}` })
    }

    // --- DARE ---
    if (commandName === 'dare') {
      const dares = [
        'Send a selfie right now.',
        'Type your last message with your eyes closed.',
        'Send a voice note singing your favorite song.',
        'Change your profile picture to a funny meme for 1 hour.',
        'Text your crush and say "I like you".',
        'Send a message to the 5th person in your chat list saying "Hello, I miss you".',
        'Do 10 pushups right now and send a voice note confirming it.'
      ]
      const randomDare = dares[Math.floor(Math.random() * dares.length)]
      return sock.sendMessage(jid, { text: `🔥 *DARE:*\n\n${randomDare}` })
    }

    // --- RATE ---
    if (commandName === 'rate') {
      const target = args.join(' ')
      if (!target) return sock.sendMessage(jid, { text: 'Provide something to rate.' })

      const score = Math.floor(Math.random() * 101)
      let comment = ''
      if (score < 20) comment = 'Terrible. 💀'
      else if (score < 40) comment = 'Not great. 😐'
      else if (score < 60) comment = 'Average. 🙂'
      else if (score < 80) comment = 'Pretty good! 😎'
      else if (score < 100) comment = 'Excellent! 🔥'
      else comment = 'PERFECT! 👑'

      return sock.sendMessage(jid, { 
        text: `📊 *Rating for:* ${target}\n\nScore: *${score}/100*\nVerdict: ${comment}` 
      })
    }

    // --- COMPATIBILITY ---
    if (commandName === 'compatibility') {
      const target = quotedParticipant ? quotedParticipant.split('@')[0] : args[0]?.replace(/[^0-9]/g, '')
      const user1 = sender.split('@')[0]
      const user2 = target || 'Unknown'

      if (!target) return sock.sendMessage(jid, { text: 'Tag someone or reply to their message to check compatibility.' })

      const percentage = Math.floor(Math.random() * 101)
      let message = ''
      if (percentage < 30) message = 'There is no hope for you two. 💔'
      else if (percentage < 60) message = 'You might want to think about it. 😬'
      else if (percentage < 80) message = 'You look great together! ❤️'
      else message = 'Made for each other! 💍'

      return sock.sendMessage(jid, { 
        text: `❤️ *Compatibility Match*\n\n👤 @${user1}\n➕\n👤 @${user2}\n\n*Score:* ${percentage}%\n*Verdict:* ${message}`,
        mentions: [sender, target ? `${target}@s.whatsapp.net` : sender]
      })
    }
  }
}
