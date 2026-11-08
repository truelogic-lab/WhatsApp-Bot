'use strict'


const _0x4a2b = 'V2FycmVu'
const _0x9c1d = 'UG93ZXJlZCBieSBXYXJyZW4='

function getOwnerName() {
  return Buffer.from(_0x4a2b, 'base64').toString('utf-8')
}

function getFooter() {
  return Buffer.from(_0x9c1d, 'base64').toString('utf-8')
}

function formatFooter() {
  const name = getOwnerName()
  return `\n\n> *⚡ ${name}-ᴍᴅ | ${getFooter()} 🔥*`
}

module.exports = { getOwnerName, getFooter, formatFooter }
