const convertRoomsObjects = require('./convertRoomsObjects');

module.exports = function engine(config) {
  config.engine.on('init', async type => {
    const { storage: { db } } = config.common
    if (type === 'main') {
      config.engine.on('mainLoopStage', async stage => {
        try {
          const users = (await db.users.find({})).filter(user => user.active === 10000)
          const roomsObjects = await db['rooms.objects'].find({})
          const intents = await db["rooms.intents"].find({});
          convertRoomsObjects(roomsObjects,intents, users)
        } catch (error) {
          console.log(error)
          log(error, "error_engine.log")
        }
      })
    }
  })
}