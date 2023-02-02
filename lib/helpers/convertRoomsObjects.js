const fs = require('fs');
const log = require('log-to-file');
const { loopThrough, getConfig, exponentialMovingAverage, getMicroTimestamp, setDefaultRoomStatsOnMissingRooms } = require("./functions")
const graphite = require('graphite');
const serverConfig = getConfig();
const graphiteEnabled = typeof serverConfig.relayPort === "number"
const isWindows = process.platform === 'win32';
const client = graphite.createClient(`plaintext://${isWindows ? "host.docker.internal" : "172.17.0.1"}:${serverConfig.relayPort}/`);

const HandleUsersStats = require("./handle/users");
const HandleRoomsObjectsStats = require("./handle/roomsObjects");
const HandleRoomsIntentsStats = require("./handle/roomsIntents");
const HandleFinalizeStats = require("./handle/finalize");

// Step 1: Modify
// Step 2: Prepare
// Step 3: Handle

function handle(getUsers, getRoomsObjects, getRoomsIntentsObjects, serverConfig, gameTime) {
  return new Promise(function (resolve, reject) {
    const startTime = getMicroTimestamp()
    Promise.all([getUsers, getRoomsObjects, getRoomsIntentsObjects]).then(values => {
      const loadEndTime = getMicroTimestamp()
      const loadTimeCost = loadEndTime - startTime;
      const users = values[0]
      const roomsObjects = values[1]
      const roomsIntentsObjects = values[2]
      log(`Loaded ${users.length} users, ${roomsObjects.length} rooms objects, ${roomsIntentsObjects.length} rooms intents in ${Math.round(loadTimeCost)} microseconds at ${gameTime}`, 'logs/engine.log')

      Promise.all([HandleUsersStats(users, serverConfig.usersStats), serverConfig.roomsObjectsStats > 0 ? HandleRoomsObjectsStats(users, roomsObjects, serverConfig.roomsObjectsStats) : {}, serverConfig.roomsIntentsStats > 0 ? HandleRoomsIntentsStats(users, roomsObjects, roomsIntentsObjects, serverConfig.roomsIntentsStats) : {}]).then(values => {
        const handledUsers = values[0]
        const handledRoomsObjects = values[1]
        const handledRoomsIntents = values[2]
        const handledFinalize = HandleFinalizeStats(handledUsers, handledRoomsObjects, handledRoomsIntents)

        const totalTime = getMicroTimestamp() - loadEndTime;
        const timeTaken = { loadTime: loadTimeCost, handleTime: totalTime }

        const previous = fs.existsSync('./handlingTimeTaken.json') ? JSON.parse(fs.readFileSync('./handlingTimeTaken.json', 'utf8')) : timeTaken;
        const times = Object.entries(timeTaken)
        const originalTimes = {}
        for (let t = 0; t < times.length; t++) {
          const time = times[t];
          const name = time[0];

          const currentTime = time[1] / 1000 / serverConfig.runEveryTicks
          const multiplier = Math.pow(10, 2)
          const currentRoundedTime = Math.round(currentTime * multiplier) / multiplier

          const previousTime = previous[name]
          originalTimes[name] = currentRoundedTime
          timeTaken[name] = exponentialMovingAverage(currentRoundedTime, previousTime, 25)
        }

        handledFinalize.timeTaken = timeTaken
        handledFinalize.gameTime = gameTime
        originalTimes.totalTime = (originalTimes.loadTime + originalTimes.handleTime)
        log(JSON.stringify(originalTimes), "handlingTimeTaken.log")
        fs.writeFileSync('./handlingTimeTaken.json', JSON.stringify(timeTaken));
        resolve(handledFinalize)
      }, reason => {
        log(reason, "logs/error.log")
        console.log(reason)
        reject(reason)
      });
    }, reason => {
      log(reason, "logs/error.log")
      console.log(reason)
      reject(reason)
    });
  })
}

module.exports = async function convert(getUsers, getRoomsObjects, getRoomsIntents, gameTime) {
  try {
    const previous = fs.existsSync('./roomsObjects.json') ? JSON.parse(fs.readFileSync('./roomsObjects.json', 'utf8')) : await handle(getUsers, getRoomsObjects, getRoomsIntents, serverConfig, gameTime);
    let current = await handle(getUsers, getRoomsObjects, getRoomsIntents, serverConfig, gameTime);
    current = setDefaultRoomStatsOnMissingRooms(previous, current);
    const startTime = getMicroTimestamp()

    if (graphiteEnabled) client.write({ directPush: { serverStats: current } }, (err) => {
      if (err) log(err, "logs/grafana_error.log");
    });
    const result = loopThrough(previous, current, serverConfig.runEveryTicks).current;
    if (result !== undefined) fs.writeFileSync('./roomsObjects.json', JSON.stringify(result));
    const endTime = getMicroTimestamp() - startTime;
    log(`Pushed stats in ${Math.round(endTime)} microseconds`, 'logs/pushingTimeTaken.log')
  } catch (error) {
    log(`${error.message} - ${error.stack}`, "logs/error.log")
  }
}