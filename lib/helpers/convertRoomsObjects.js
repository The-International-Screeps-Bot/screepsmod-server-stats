const fs = require('fs');
const log = require('log-to-file');
const { loopThrough, getConfig, exponentialMovingAverage, getMicroTimestamp } = require("./functions")

const HandleUsersStats = require("./handle/users");
const HandleRoomsObjectsStats = require("./handle/roomsObjects");
const HandleRoomsIntentsStats = require("./handle/roomsIntents");
const HandleFinalizeStats = require("./handle/finalize");

// Step 1: Modify
// Step 2: Prepare
// Step 3: Handle

function handle(users, roomsObjects, roomsIntentsObjects, serverConfig, loadTimeCost) {
  const startTime = getMicroTimestamp()
  const handledUsers = HandleUsersStats(users, serverConfig.usersStats)
  const endTimeUsers = getMicroTimestamp()
  const timeUsers = endTimeUsers - startTime

  const handledRoomsObjects = serverConfig.roomsObjectsStats > 0 ? HandleRoomsObjectsStats(users, roomsObjects, serverConfig.roomsObjectsStats) : {}
  const endTimeRoomsObjects = getMicroTimestamp()
  const timeRoomsObjects = endTimeRoomsObjects - endTimeUsers

  const handledRoomsIntents = serverConfig.roomsIntentsStats > 0 ? HandleRoomsIntentsStats(users, roomsObjects, roomsIntentsObjects, serverConfig.roomsIntentsStats) : {}
  const endTimeRoomsIntents = getMicroTimestamp()
  const timeRoomsIntents = endTimeRoomsIntents - endTimeRoomsObjects

  const handledFinalize = HandleFinalizeStats(handledUsers, handledRoomsObjects, handledRoomsIntents)
  const endTimeFinalize = getMicroTimestamp()
  const timeFinalize = endTimeFinalize - endTimeRoomsIntents

  const totalTime = getMicroTimestamp() - startTime;
  const timeTaken = { loadTime: loadTimeCost, users: timeUsers, roomsObjects: timeRoomsObjects, roomsIntents: timeRoomsIntents, finalize: timeFinalize, total: totalTime }
  handledFinalize.timeTaken = timeTaken

  const previous = fs.existsSync('./handlingTimeTaken.json') ? JSON.parse(fs.readFileSync('./handlingTimeTaken.json', 'utf8')) : timeTaken;
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
  log(JSON.stringify(originalTimes), "handlingTimeTaken.log")
  fs.writeFileSync('./handlingTimeTaken.json', JSON.stringify(timeTaken));

  return handledFinalize
}

module.exports = function convert(usersObjects, roomsObjectsObjects, roomsIntentsObjects, loadStartTime) {
  try {
    const loadTimeCost = getMicroTimestamp() - loadStartTime;
    const serverConfig = getConfig()
    const previous = fs.existsSync('./roomsObjects.json') ? JSON.parse(fs.readFileSync('./roomsObjects.json', 'utf8')) : handle(usersObjects, roomsObjectsObjects, roomsIntentsObjects, serverConfig, loadTimeCost);
    const current = handle(usersObjects, roomsObjectsObjects, roomsIntentsObjects, serverConfig, loadTimeCost);

    const result = loopThrough(previous, current).current;
    if (result !== undefined) fs.writeFileSync('./roomsObjects.json', JSON.stringify(result));
  } catch (error) {
    log(error, "error.log")
  }
}