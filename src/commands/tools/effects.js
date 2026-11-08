'use strict'

const logger = require('../../utils/logger')

module.exports = {
  name: 'effects',
  permission: 'public',
  aliases: [
    'cry', 'hot', 'hug', 'joy', 'moon', 'pat', 'sad', 'shy', 'sus', 'wave', 'wink', 'bite', 
    'cool', 'dare', 'flip', 'hate', 'joke', 'kiss', 'lick', 'love', 'nerd', 'pick', 'poke', 
    'poor', 'rich', 'roll', 'slap', 'slow', 'smug', 'tail', 'yeet', 'blush', 'bonk', 'bruh', 
    'clap', 'faint', 'fancy', 'flag', 'fast', 'kill', 'laugh', 'lucky', 'pray', 'sick', 'slam', 
    'weak', 'angry', 'bored', 'crush', 'cuddle', 'dance', 'dumb', 'happy', 'heart', 'hungry', 
    'nerdy', 'proud', 'smart', 'tired', 'brain', 'brave', 'calm', 'clumsy', 'confused', 'cringe', 
    'dream', 'grumpy', 'honest', 'humble', 'jealous', 'kind', 'lazy', 'lonely', 'mystic', 
    'nervous', 'polite', 'quiet', 'sassy', 'silly', 'sleepy', 'strong', 'stupid', 'sweat', 
    'thankful', 'thirsty', 'tickle', 'unlucky', 'weird', 'win', 'worry'
  ],
  execute: async ({ sock, jid, commandName }) => {
    
    // Custom transition sequences for every single command
    const transitions = {
      cry: ['😐', '🥺', '😭', '😭'], hot: ['🌡️', '♨️', '🔥', '🔥'], hug: ['🫂', '🤗', '💖', '🫂'],
      joy: ['😊', '😁', '😂', '🤣'], moon: ['🌑', '🌓', '🌕', '🌙'], pat: ['✋', '🫳', '🥰', '🫳'],
      sad: ['😐', '🙁', '😔', '😢'], shy: ['😐', '😳', '🙈', '😳'], sus: ['🤨', '👀', '🤨', '🤨'],
      wave: ['👋', '👋🏻', '👋🏼', '👋'], wink: ['😉', '😜', '😉', '😉'], bite: ['🦷', '😬', '🦷', '🦷'],
      cool: ['😎', '🕶️', '😎', '😎'], dare: ['😈', '🔥', '😈', '🔥'], flip: ['😐', '🤸', '🤸', '🤸'],
      hate: ['😐', '😠', '💔', '💔'], joke: ['😐', '😏', '🤣', '🤡'], kiss: ['😗', '😙', '😘', '😘'],
      lick: ['👅', '😋', '👅', '👅'], love: ['🖤', '💖', '💘', '💖'], nerd: ['🤓', '📚', '🤓', '🤓'],
      pick: ['☝️', '👆', '☝️', '👆'], poke: ['👉', '🫵', '👉', '👉'], poor: ['🪙', '🥺', '🫠', '🥺'],
      rich: ['💰', '💵', '🤑', '🤑'], roll: ['😐', '🙃', '🔄', '🔄'], slap: ['✋', '💥', '🤕', '👋'],
      slow: ['🐇', '🚶', '🐢', '🐢'], smug: ['😏', '😼', '😏', '😏'], tail: ['🐕', '🐈', '🦊', '🐕'],
      yeet: ['🤾', '💨', '🚀', '🚀'], blush: ['😐', '😊', '☺️', '☺️'], bonk: ['😐', '😲', '🔨', '🔨'],
      bruh: ['😐', '😑', '😑', '😑'], clap: ['👏', '👏🏻', '👏🏼', '👏'], faint: ['😐', '😵', '😵‍💫', '😵'],
      fancy: ['✨', '🌟', '💫', '✨'], flag: ['🏳️', '🏁', '🚩', '🚩'], fast: ['🐌', '🏃', '⚡', '⚡'],
      kill: ['😐', '😠', '🔪', '🔪'], laugh: ['😐', '😄', '😆', '😂'], lucky: ['🍀', '🎰', '🍀', '🍀'],
      pray: ['🙏', '🙏🏻', '🙏🏼', '🙏'], sick: ['🤢', '🤮', '🤒', '🤒'], slam: ['🚪', '💥', '🤬', '🤬'],
      weak: ['🥺', '🫠', '🥀', '🫠'], angry: ['😐', '😠', '🤬', '😡'], bored: ['😐', '🥱', '😒', '😒'],
      crush: ['🖤', '💖', '💘', '💖'], cuddle: ['🤗', '🫂', '💖', '🤗'], dance: ['💃', '🕺', '🎶', '💃'],
      dumb: ['🤔', '💭', '🫠', '🫠'], happy: ['😐', '🙂', '😄', '😊'], heart: ['🖤', '💔', '💖', '❤️'],
      hungry: ['😋', '🤤', '🍔', '🤤'], nerdy: ['🤓', '📚', '🤓', '🤓'], proud: ['☺️', '😌', '😎', '🥹'],
      smart: ['🤔', '💡', '🧠', '🧠'], tired: ['😪', '🥱', '😴', '😴'], brain: ['🤔', '💡', '🧠', '🧠'],
      brave: ['🦁', '🛡️', '💪', '🦸'], calm: ['🍃', '🌊', '🧘', '😌'], clumsy: ['🤸', '💥', '🤕', '🤦'],
      confused: ['😐', '🤔', '😵‍💫', '😕'], cringe: ['😬', '😖', '😬', '😬'], dream: ['💭', '☁️', '🌙', '💤'],
      grumpy: ['😤', '😡', '🤬', '😠'], honest: ['😐', '🙂', '💯', '🤝'], humble: ['🙂', '😌', '🙏', '🥺'],
      jealous: ['👀', '😒', '💔', '😤'], kind: ['🥰', '💖', '🌸', '🤗'], lazy: ['🥱', '😪', '🛌', '💤'],
      lonely: ['😐', '🥺', '😔', '😢'], mystic: ['🔮', '🌌', '✨', '🪄'], nervous: ['😐', '😟', '😰', '😰'],
      polite: ['🙂', '🙏', '😊', '🤝'], quiet: ['🤫', '😶', '😐', '🤐'], sassy: ['💁', '😏', '💅', '💅'],
      silly: ['😜', '🤪', '😂', '🤡'], sleepy: ['🥱', '😴', '💤', '😴'], strong: ['💪', '💪🏻', '💪🏼', '💪'],
      stupid: ['😐', '🤔', '🫠', '🫠'], sweat: ['😅', '💦', '🥵', '💧'], thankful: ['🙏', '🥰', '💖', '🙌'],
      thirsty: ['🥵', '🥤', '💧', '🥤'], tickle: ['🤣', '😂', '🤣', '🤣'], unlucky: ['☔', '🌧️', '⚡', '☔'],
      weird: ['😐', '🤨', '😬', '👽'], win: ['🏆', '🥇', '🎉', '👑'], worry: ['😐', '😟', '😰', '😥']
    }

    const sequence = transitions[commandName] || ['😐', '😶', '😮', '✨']

    try {
      const sentMsg = await sock.sendMessage(jid, { text: sequence[0] })
      
      for (let i = 1; i < sequence.length; i++) {
        await new Promise(r => setTimeout(r, 400)) 
        await sock.sendMessage(jid, { text: sequence[i], edit: sentMsg.key })
      }

      await new Promise(r => setTimeout(r, 1500))
      
    } catch (error) {
      logger.error(`Effect animation failed: ${error.message}`)
    }
  }
}
