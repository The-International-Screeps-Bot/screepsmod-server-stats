const fs = require('fs');
const log = require('log-to-file');
const { loopThrough, getConfig, exponentialMovingAverage } = require("./functions")

const HandleUsersStats = require("./handle/users");
const HandleRoomsObjectsStats = require("./handle/roomsObjects");
const HandleRoomsIntentsStats = require("./handle/roomsIntents");
const HandleFinalizeStats = require("./handle/finalize");

// Step 1: Modify
// Step 2: Prepare
// Step 3: Handle

function handle(users, roomsObjects, roomsIntentsObjects, serverConfig) {
  const startTime = new Date().getTime()
  const handledUsers = HandleUsersStats(users, serverConfig.usersStats)
  const endTimeUsers = new Date().getTime()
  const timeUsers = endTimeUsers - startTime
  
  const handledRoomsObjects = serverConfig.roomsObjectsStats > 0 ? HandleRoomsObjectsStats(users, roomsObjects, serverConfig.roomsObjectsStats) : {}
  const endTimeRoomsObjects = new Date().getTime()
  const timeRoomsObjects = endTimeRoomsObjects - endTimeUsers

  const handledRoomsIntents = serverConfig.roomsIntentsStats ? HandleRoomsIntentsStats(users, roomsObjects, roomsIntentsObjects, serverConfig.roomsIntentsStats) : {}
  const endTimeRoomsIntents = new Date().getTime()
  const timeRoomsIntents = endTimeRoomsIntents - endTimeRoomsObjects

  const handledFinalize = HandleFinalizeStats(handledUsers, handledRoomsObjects, handledRoomsIntents)
  const endTimeFinalize = new Date().getTime()
  const timeFinalize = endTimeFinalize - endTimeRoomsIntents

  const totalTime = new Date().getTime() - startTime;

  const timeTaken = {users:timeUsers, roomsObjects:timeRoomsObjects, roomsIntents:timeRoomsIntents, finalize: timeFinalize, total: totalTime}
  const previous = fs.existsSync('./handlingTimeTaken.json') ? JSON.parse(fs.readFileSync('./handlingTimeTaken.json', 'utf8')) : timeTaken;
  const times = Object.entries(timeTaken)
  for (let t = 0; t < times.length; t++) {
    const time = times[t];
    const name = time[0]
    const currentTime = time[1]
    const previousTime = previous[name]
    timeTaken[name] = exponentialMovingAverage(currentTime, previousTime, 5000)
  }
  fs.writeFileSync('./handlingTimeTaken.json', JSON.stringify(timeTaken));
  log(JSON.stringify(timeTaken) , "handlingTimeTaken.log")
  return handledFinalize
}

module.exports = function convert(usersObjects, roomsObjectsObjects, roomsIntentsObjects,) {
  try {
    const serverConfig = getConfig()
    const previous = fs.existsSync('./roomsObjects.json') ? JSON.parse(fs.readFileSync('./roomsObjects.json', 'utf8')) : handle(usersObjects, roomsObjectsObjects, roomsIntentsObjects, serverConfig);
    const current = handle(usersObjects, roomsObjectsObjects, roomsIntentsObjects, serverConfig);

    const result = loopThrough(previous, current).current;
    if (result !== undefined) fs.writeFileSync('./roomsObjects.json', JSON.stringify(result));
  } catch (error) {
    log(error, "error.log")
  }
}