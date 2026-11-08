'use strict'

const fs = require('fs')
const path = require('path')
const logger = require('../utils/logger')

const commands = new Map()

function loadCommands() {
  const commandsDir = path.join(__dirname, '../commands')
  
  if (!fs.existsSync(commandsDir)) {
    fs.mkdirSync(commandsDir, { recursive: true })
  }

  const readDirectory = (dir) => {
    const files = fs.readdirSync(dir)
    
    for (const file of files) {
      const fullPath = path.join(dir, file)
      const stat = fs.statSync(fullPath)

      if (stat.isDirectory()) {
        readDirectory(fullPath)
      } else if (file.endsWith('.js')) {
        try {
          const command = require(fullPath)
          
          if (!command.name || typeof command.execute !== 'function') {
            logger.warn(`Invalid command format in ${file}. Skipping.`)
            continue
          }

         
          commands.set(command.name, command)
          
         
          if (command.aliases && Array.isArray(command.aliases)) {
            for (const alias of command.aliases) {
              commands.set(alias, command)
            }
          }
          
          logger.debug(`Registered command: ${command.name}`)
        } catch (error) {
          logger.error(`Failed to load command ${file}: ${error.message}`)
        }
      }
    }
  }

  readDirectory(commandsDir)
  logger.info(`Successfully loaded ${commands.size} command(s).`)
}

function getCommand(name) {
  return commands.get(name)
}

function getCommandCount() {

  const uniqueCommands = new Set(Array.from(commands.values()))
  return uniqueCommands.size
}

module.exports = { loadCommands, getCommand, getCommandCount }
