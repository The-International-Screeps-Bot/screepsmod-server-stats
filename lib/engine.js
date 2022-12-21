const convertRoomsObjects = require('./convertRoomsObjects');
const convertUserObjects = require('./convertUserObjects');

module.exports = function engine(config) {
  config.engine.on('init', async type => {
    const { storage: { db } } = config.common
    if (type === 'main') {
      config.engine.on('mainLoopStage', async stage => {
        const users = (await db.users.find({})).filter(user => user.active === 10000)
        const roomsObjects = await db['rooms.objects'].find({})

        convertRoomsObjects(roomsObjects,users)
        convertUserObjects(users)
      })
    }
  })
}