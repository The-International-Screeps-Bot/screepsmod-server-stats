const fs = require('fs');
const log = require('log-to-file');
const {loopThrough} = require("./functions")

const HandleUsersStats = require("./handle/users");
const HandleRoomsObjectsStats = require("./handle/roomsObjects");
const HandleRoomsIntentsStats = require("./handle/roomsIntents");
const HandleFinalizeStats = require("./handle/finalize");

// Step 1: Modify
// Step 2: Prepare
// Step 3: Handle

// function handleServerStats(users, roomsObjects) {
//   const stats = {}


//     stats[user.username] = {
//       user: HandleUsersStats(user),
//       owned: ownedRooms,
//       reserved: reservedRooms
//     }
//   }

//   if (Object.keys(stats).length === 0) {
//     return undefined
//   }
//   return stats
// };

function handle(users, roomsObjects, roomsIntentsObjects) {
  const handledUsers = HandleUsersStats(users)
  const handledRoomsObjects = HandleRoomsObjectsStats(users, roomsObjects)
  const handledRoomsIntents = HandleRoomsIntentsStats(users, roomsObjects, roomsIntentsObjects)
  const handledFinalize = HandleFinalizeStats(handledUsers, handledRoomsObjects, handledRoomsIntents)
  return handledFinalize
}

module.exports = function convert(usersObjects, roomsObjectsObjects, roomsIntentsObjects, ) {
  try {
    const previous = fs.existsSync('./roomsObjects.json') ? JSON.parse(fs.readFileSync('./roomsObjects.json', 'utf8')) : handle(usersObjects, roomsObjectsObjects, roomsIntentsObjects);
    const current = previous

    const result = loopThrough(previous, current).current;
    if (result !== undefined) fs.writeFileSync('./roomsObjects.json', JSON.stringify(result));
  } catch (error) {
    log(error, "error.log")
  }
}