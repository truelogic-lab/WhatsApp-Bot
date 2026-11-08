'use strict'

const { MongoClient } = require('mongodb')
const { proto, initAuthCreds, BufferJSON } = require('@whiskeysockets/baileys')

let mongoClient = null
let collection = null

async function connectSessionDB() {
  if (process.env.MONGO_URI) {
    mongoClient = new MongoClient(process.env.MONGO_URI)
    await mongoClient.connect()
    collection = mongoClient.db('WarrenXMD').collection('sessions')
  }
}

async function useMongoAuthState() {
  await connectSessionDB()
  
  if (!collection) {
    throw new Error('MongoDB session collection not initialized.')
  }

  const writeData = async (data, id) => {
    await collection.updateOne(
      { _id: id },
      { $set: { data: JSON.stringify(data, BufferJSON.replacer) } },
      { upsert: true }
    )
  }

  const readData = async (id) => {
    const doc = await collection.findOne({ _id: id })
    if (!doc) return null
    return JSON.parse(doc.data, BufferJSON.reviver)
  }

  const removeData = async (id) => {
    await collection.deleteOne({ _id: id })
  }

  const creds = (await readData('creds')) || initAuthCreds()

  return {
    state: {
      creds,
      keys: {
        get: async (type, ids) => {
          const data = {}
          await Promise.all(
            ids.map(async (id) => {
              let value = await readData(`${type}-${id}`)
              if (type === 'app-state-sync-key' && value) {
                value = proto.Message.AppStateSyncKeyData.fromObject(value)
              }
              data[id] = value
            })
          )
          return data
        },
        set: async (data) => {
          const tasks = []
          for (const category in data) {
            for (const id in data[category]) {
              const value = data[category][id]
              const key = `${category}-${id}`
              tasks.push(value ? writeData(value, key) : removeData(key))
            }
          }
          await Promise.all(tasks)
        }
      }
    },
    saveCreds: () => writeData(creds, 'creds')
  }
}

module.exports = { useMongoAuthState }
