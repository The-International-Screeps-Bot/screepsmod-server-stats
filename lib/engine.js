const log = require('log-to-file');
const convertRoomsObjects = require('./helpers/convertRoomsObjects');
const { getConfig } = require("./helpers/functions")

module.exports = function engine(config) {
  config.engine.on('init', async type => {
    const { storage: { db, env } } = config.common
    if (type === 'main') {
      config.engine.on('mainLoopStage', async stage => {
        if (stage !== 'finish') return
        try {
          if (!config.common.storage.pubsub.publish) return // Try to catch early tick attempts
          const gameTime = parseInt(await env.get(env.keys.GAMETIME))
          const serverConfig = getConfig()

          if (gameTime < 100 || gameTime % (serverConfig.runEveryTicks || 50) !== 0) return
          convertRoomsObjects(db.users.find({}), db['rooms.objects'].find({}), db["rooms.intents"].find({}), gameTime)
        } catch (error) {
          console.log(error)
          log(error, "error_engine.log")
        }
      })
    }
  })
}