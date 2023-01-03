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
          const startLoad2 = getMicroTimestamp()
          const timeUsers = startLoad2 - startLoad

          const roomsObjects = await db['rooms.objects'].find({})
          const startLoad3 = getMicroTimestamp()
          const timeRoomsObjects = startLoad3 - startLoad2

          const intents = await db["rooms.intents"].find({});
          const end = getMicroTimestamp()
          const timeRoomsIntents = end - startLoad3
          convertRoomsObjects(users, roomsObjects, intents, startLoad)

          const timeTaken = { users: timeUsers, roomsObjects: timeRoomsObjects, roomsIntents: timeRoomsIntents, total: timeUsers+timeRoomsObjects+timeRoomsIntents }
          const previous = fs.existsSync('./handlingTimeTakenEngine.json') ? JSON.parse(fs.readFileSync('./handlingTimeTakenEngine.json', 'utf8')) : timeTaken;
          const times = Object.entries(timeTaken)
          const originalTimes = {}
          for (let t = 0; t < times.length; t++) {
            const time = times[t];
            const name = time[0]

            const currentTime = time[1] / 1000
            const multiplier = Math.pow(10, 2)
            const currentRoundedTime = Math.round(currentTime * multiplier) / multiplier

            const previousTime = previous[name]
            originalTimes[name] = currentRoundedTime
            timeTaken[name] = exponentialMovingAverage(currentRoundedTime, previousTime, 500)
          }
          log(JSON.stringify(originalTimes), "handlingTimeTakenEngine.log")
          fs.writeFileSync('./handlingTimeTakenEngine.json', JSON.stringify(timeTaken));
        } catch (error) {
          console.log(error)
          log(error, "error_engine.log")
        }
      })
    }
  })
}