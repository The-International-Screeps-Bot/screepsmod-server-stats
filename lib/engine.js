const log = require('log-to-file');
const convertRoomsObjects = require('./helpers/convertRoomsObjects');
const { getConfig, getUsers, getRoomsObjects, getRoomsIntents } = require("./helpers/functions")

module.exports = function engine(config) {
  config.engine.on('init', async type => {
    const { storage: { db, env } } = config.common
    if (type === 'main') {
      config.engine.on('mainLoopStage', async stage => {
        const a = await db['rooms.intents'].find({});
        log(`${a.length} - ${stage} intents found`, "engine2.log")
        if (stage !== 'waitForRooms') return
        try {
          const gameTime = parseInt(await env.get(env.keys.GAMETIME))
          const serverConfig = getConfig()
          if (gameTime % (serverConfig.runEveryTicks || 50) !== 0 || gameTime < 100) {
            log(`Skipping engine run at tick ${gameTime}`, "engine.log")
            return
          }
          convertRoomsObjects(getUsers(db.users.find({})), getRoomsObjects(db['rooms.objects'].find({})), getRoomsIntents(db['rooms.intents'].find({})), gameTime)
        } catch (error) {
          console.log(error)
          log(error, "error_engine.log")
        }
      })
    }
  })
}