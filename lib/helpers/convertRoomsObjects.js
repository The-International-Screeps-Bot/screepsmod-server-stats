const fs = require('fs');
const log = require('log-to-file');

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

module.exports = function convert(roomsObjectsObjects, roomsIntentsObjects, usersObjects) {
  try {
    const handledUsers = HandleUsersStats(usersObjects)
    const handledRoomsObjects = HandleRoomsObjectsStats(handledUsers, roomsObjectsObjects)
    const handledRoomsIntents ={}
    // const handledRoomsIntents = HandleRoomsIntentsStats(handledUsers, handledRoomsObjects, roomsIntentsObjects)
    const handledFinalize = HandleFinalizeStats(handledUsers, handledRoomsObjects, handledRoomsIntents)
    console.log(handledFinalize)
    // const modifiedRoomsObjects = ModifyRoomsObjects(roomsObjects)
    // const modifiedRoomIntents = ModifyRoomsIntents(roomIntents, modifiedRoomsObjects, users)

    // const previous = fs.existsSync('./roomsObjects.json') ? JSON.parse(fs.readFileSync('./roomsObjects.json', 'utf8')) : handleServerStats(users, modifiedRoomsObjects);
    // const current = handleServerStats(users, modifiedRoomsObjects);

    // const result = loopThrough(previous, current).current;
    // if (result !== undefined) fs.writeFileSync('./roomsObjects.json', JSON.stringify(result));
  } catch (error) {
    log(error, "error.log")
  }
}