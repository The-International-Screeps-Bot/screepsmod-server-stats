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
  const handledRoomsObjects = HandleRoomsObjectsStats(users, roomsObjects, serverConfig.roomsObjectsStats)
  const handledRoomsIntents = HandleRoomsIntentsStats(users, roomsObjects, roomsIntentsObjects, serverConfig.roomsIntentsStats)
  const handledFinalize = HandleFinalizeStats(handledUsers, handledRoomsObjects, handledRoomsIntents)

  const endTime = new Date().getTime()
  const time = endTime - startTime
  const previous = fs.existsSync('./handlingTimeTaken.json') ? fs.readFileSync('./handlingTimeTaken.json', 'utf8') : time;
  fs.writeFileSync('./handlingTimeTaken.json', exponentialMovingAverage(previous, time, 5000));
  log(time, "handlingTimeTaken.log")
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