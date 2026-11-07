'use strict'

const logger = require('../../utils/logger')

module.exports = {
  name: 'effects',
  permission: 'public',
  aliases: [
    'happy', 'sad', 'angry', 'shy', 'moon', 'confused', 'hot', 'fancy', 'flag', 'heart', 
    'nikall', 'remini', 'blur', 'removebg', 'simdata', 'ssweb', 'boost', 'hashtag', 'unblur', 
    'waifu', 'neko', 'kitsune', 'husbando', 'animegirl', 'animeboy', 'catgirl', 'foxgirl', 
    'kawaii', 'otaku', 'manga', 'cosplay', 'schoolgirl', 'maid', 'uniform', 'fantasy', 
    'warrior', 'samurai', 'ninja', 'magical', 'demon', 'angel', 'vampire', 'elf', 'princess', 
    'prince', 'chibi', 'idol', 'gamer', 'laugh', 'cry', 'blush', 'bonk', 'cuddle', 'hug', 
    'kiss', 'lick', 'pat', 'slap', 'smug', 'wave', 'wink', 'bite', 'poke', 'dance', 'kill', 
    'tail', 'tickle', 'roll', 'flip', 'pick', 'joke', 'truth', 'dare', 'shrug', 'facepalm', 
    'yeet', 'triggered', 'scream', 'faint', 'clap', 'pray', 'salute', 'cringe', 'bruh', 'sus', 
    'sigma', 'nervous', 'bored', 'sleepy', 'hungry', 'thirsty', 'sick', 'cool', 'nerd', 'rich', 
    'poor', 'strong', 'weak', 'fast', 'slow', 'smart', 'dumb', 'lucky', 'unlucky', 'love', 'hate'
  ],
  execute: async ({ sock, jid, commandName }) => {
    
    // Custom transition sequences for every single command (No sharing!)
    const transitions = {
      // Emotions & Tools
      happy: ['😐', '🙂', '😄', '😊'],
      sad: ['😐', '🙁', '😔', '😢'],
      angry: ['😐', '😠', '🤬', '😡'],
      shy: ['😐', '😳', '🙈', '😳'],
      moon: ['🌑', '🌓', '🌕', '🌙'],
      confused: ['😐', '🤔', '😵‍💫', '😕'],
      hot: ['🌡️', '♨️', '🔥', '🔥'],
      fancy: ['✨', '🌟', '💫', '✨'],
      flag: ['🏳️', '🏁', '🚩', '🚩'],
      heart: ['🖤', '💔', '💖', '❤️'],
      nikall: ['😈', '👿', '😈', '😈'],
      remini: ['📸', '📷', '🖼️', '🪄'],
      blur: ['👁️', '🌫️', '💧', '💧'],
      removebg: ['🖼️', '✂️', '🪄', '🪄'],
      simdata: ['📱', '💳', '📡', '📱'],
      ssweb: ['💻', '🌐', '🔗', '🌐'],
      boost: ['🚀', '💨', '🌌', '🚀'],
      hashtag: ['#️⃣', '🔢', '📈', '#️⃣'],
      unblur: ['👁️', '👓', '🔍', '🔍'],
      
      // Anime
      waifu: ['👩', '💃', '👗', '👩'],
      neko: ['🐾', '🐈', '😻', '🐱'],
      kitsune: ['🦊', '🔥', '🦊', '🦊'],
      husbando: ['🤵', '🕴️', '👔', '🤵'],
      animegirl: ['👧', '🌸', '✨', '👧'],
      animeboy: ['👦', '⚔️', '🔥', '👦'],
      catgirl: ['🐈', '👧', '😺', '😺'],
      foxgirl: ['🦊', '👧', '🦊', '🦊'],
      kawaii: ['🌸', '💖', '🎀', '🌸'],
      otaku: ['🤓', '📚', '📺', '🤓'],
      manga: ['📖', '📚', '📖', '📚'],
      cosplay: ['🎭', '👗', '🎭', '🎭'],
      schoolgirl: ['🎒', '🏫', '👧', '🎒'],
      maid: ['🧹', '👗', '🧹', '🧹'],
      uniform: ['👔', '🏫', '👔', '👔'],
      fantasy: ['🐉', '🦄', '🧚', '🐉'],
      warrior: ['🛡️', '⚔️', '🛡️', '⚔️'],
      samurai: ['🗡️', '🏯', '⛩️', '🗡️'],
      ninja: ['🥷', '💨', '🥷', '🥷'],
      magical: ['✨', '🔮', '🪄', '✨'],
      demon: ['😈', '🔥', '👹', '👹'],
      angel: ['☁️', '😇', '🕊️', '😇'],
      vampire: ['🧛', '🩸', '🦇', '🧛'],
      elf: ['🧝', '🏹', '🌲', '🧝'],
      princess: ['👸', '👑', '🏰', '👸'],
      prince: ['🤴', '👑', '🏰', '🤴'],
      chibi: ['👶', '🍼', '👶', '👶'],
      idol: ['🌟', '🎤', '🎶', '🌟'],
      gamer: ['🎮', '🕹️', '🎮', '🎮'],
      
      // Fun & Reactions
      laugh: ['😐', '😄', '😆', '😂'],
      cry: ['😐', '🥺', '😭', '😭'],
      blush: ['😐', '😊', '☺️', '☺️'],
      bonk: ['😐', '😲', '🔨', '🔨'],
      cuddle: ['🤗', '🫂', '💖', '🤗'],
      hug: ['🫂', '🤗', '💖', '🫂'],
      kiss: ['😗', '😙', '😘', '😘'],
      lick: ['👅', '😋', '👅', '👅'],
      pat: ['✋', '🫳', '🥰', '🫳'],
      slap: ['✋', '💥', '🤕', '👋'],
      smug: ['😏', '😼', '😏', '😏'],
      wave: ['👋', '👋🏻', '👋🏼', '👋'],
      wink: ['😉', '😜', '😉', '😉'],
      bite: ['🦷', '😬', '🦷', '🦷'],
      poke: ['👉', '🫵', '👉', '👉'],
      dance: ['💃', '🕺', '🎶', '💃'],
      kill: ['😐', '😠', '🔪', '🔪'],
      tail: ['🐕', '🐈', '🦊', '🐕'],
      tickle: ['🤣', '😂', '🤣', '🤣'],
      roll: ['😐', '🙃', '🔄', '🔄'],
      flip: ['😐', '🤸', '🤸', '🤸'],
      pick: ['☝️', '👆', '☝️', '👆'],
      joke: ['😐', '😏', '🤣', '🤡'],
      truth: ['🤫', '👀', '💯', '💯'],
      dare: ['😈', '🔥', '😈', '🔥'],
      shrug: ['🤷', '🤷‍♂️', '🤷‍♀️', '🤷'],
      facepalm: ['😐', '🤦', '🤦‍♂️', '🤦'],
      yeet: ['🤾', '💨', '🚀', '🚀'],
      triggered: ['😐', '😠', '💢', '😤'],
      scream: ['😐', '😧', '😱', '😱'],
      faint: ['😐', '😵', '😵‍💫', '😵'],
      clap: ['👏', '👏🏻', '👏🏼', '👏'],
      pray: ['🙏', '🙏🏻', '🙏🏼', '🙏'],
      salute: ['🫡', '🫡', '🫡', '🫡'],
      cringe: ['😬', '😖', '😬', '😬'],
      bruh: ['😐', '😑', '😑', '😑'],
      sus: ['🤨', '👀', '🤨', '🤨'],
      sigma: ['😎', '🍷', '🗿', '🗿'],
      
      // States & Traits
      nervous: ['😐', '😟', '😰', '😰'],
      bored: ['😐', '🥱', '😒', '😒'],
      sleepy: ['🥱', '😴', '💤', '😴'],
      hungry: ['😋', '🤤', '🍔', '🤤'],
      thirsty: ['🥵', '🥤', '💧', '🥤'],
      sick: ['🤢', '🤮', '🤒', '🤒'],
      cool: ['😎', '🕶️', '😎', '😎'],
      nerd: ['🤓', '📚', '🤓', '🤓'],
      rich: ['💰', '💵', '🤑', '🤑'],
      poor: ['🪙', '🥺', '🫠', '🥺'],
      strong: ['💪', '💪🏻', '💪🏼', '💪'],
      weak: ['🥺', '🫠', '🥀', '🫠'],
      fast: ['🐌', '🏃', '⚡', '⚡'],
      slow: ['🐇', '🚶', '🐢', '🐢'],
      smart: ['🤔', '💡', '🧠', '🧠'],
      dumb: ['🤔', '💭', '🫠', '🫠'],
      lucky: ['🍀', '🎰', '🍀', '🍀'],
      unlucky: ['☔', '🌧️', '⚡', '☔'],
      love: ['🖤', '💖', '💘', '💖'],
      hate: ['😐', '😠', '💔', '💔']
    }

    // Fetch the specific transition array. If not found, default to a generic sequence.
    const sequence = transitions[commandName] || ['😐', '😶', '😮', '✨']

    try {
      const sentMsg = await sock.sendMessage(jid, { text: sequence[0] })
      
      // Loop through the remaining emojis in the specific sequence
      for (let i = 1; i < sequence.length; i++) {
        await new Promise(r => setTimeout(r, 400)) 
        await sock.sendMessage(jid, { text: sequence[i], edit: sentMsg.key })
      }

      // Hold the final emoji for 1.5 seconds so the user sees it clearly
      await new Promise(r => setTimeout(r, 1500))
      
    } catch (error) {
      logger.error(`Effect animation failed: ${error.message}`)
    }
  }
}
