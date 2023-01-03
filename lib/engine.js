const convertRoomsObjects = require('./helpers/convertRoomsObjects');
const { getMicroTimestamp } = require('./helpers/functions');

module.exports = function engine(config) {
  config.engine.on('init', async type => {
    const { storage: { db } } = config.common
    if (type === 'main') {
      config.engine.on('mainLoopStage', async stage => {
        try {
          const startLoad = getMicroTimestamp()
          const users = await db.users.find({})
          const roomsObjects = await db['rooms.objects'].find({})
          const intents = await db["rooms.intents"].find({});
          convertRoomsObjects(users, roomsObjects, intents, startLoad)
        } catch (error) {
          console.log(error)
          log(error, "error_engine.log")
        }
      })
    }
  })
}