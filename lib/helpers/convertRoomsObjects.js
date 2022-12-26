const fs = require('fs');
const {loopThrough, objectFilter, groupObjectByKey} = require("./functions");
const log = require('log-to-file');

const ModifyRoomsObjects = require("./modify/roomsObjects");
const ModifyRoomsIntents = require("./modify/roomsIntents");

const HandleRoomsObjectsStats = require("./handle/roomsObjects");
const HandleUsersStats = require("./handle/users");

function handleServerStats(users, roomsObjects) {
  const stats = {}
  const ownedControllers = objectFilter(
    roomsObjects,
    (c) => c.type === 'controller' && c.user
  )
  const reservedControllers = objectFilter(
    roomsObjects,
    (c) => c.type === 'controller' && c.reservation
  )

  for (let i = 0; i < users.length; i += 1) {
    const user = users[i]
    const ownedRoomNames = Object.values(
      objectFilter(ownedControllers, (c) => c.user === user._id)
    ).map((c) => c.room)
    const reservedRoomNames = Object.values(
      objectFilter(reservedControllers, (c) => c.reservation.user === user._id)
    ).map((c) => c.room)

    const ownedObjects = objectFilter(roomsObjects, (o) =>
      ownedRoomNames.includes(o.room)
    )
    const reservedObjects = objectFilter(roomsObjects, (o) =>
      reservedRoomNames.includes(o.room)
    )

    const groupedOwnedObjects = groupObjectByKey(ownedObjects, 'room')
    const groupedReservedObjects = groupObjectByKey(reservedObjects, 'room')

    const ownedRooms = {}
    const reservedRooms = {}
    for (const room of groupedOwnedObjects.keys()) {
      const objects = groupedOwnedObjects.get(room)
      const objectsValues = Object.values(objects)
      let roomStats = {}
      roomStats = HandleRoomsObjectsStats(roomStats, objectsValues, "owned")
      ownedRooms[room] = roomStats
    }

    for (const room of groupedReservedObjects.keys()) {
      const objects = groupedReservedObjects.get(room)
      let roomStats = {}
      roomStats = HandleRoomsObjectsStats(roomStats, objects, "reserved")
      reservedRooms[room] = roomStats
    }

    stats[user.username] = {
      user: HandleUsersStats(user),
      owned: ownedRooms,
      reserved: reservedRooms
    }
  }

  if (Object.keys(stats).length === 0) {
    return undefined
  }
  return stats
};

module.exports = function convert(roomsObjects, roomIntents, users) {
  try {
    const modifiedRoomsObjects = ModifyRoomsObjects(roomsObjects)
    const modifiedRoomIntents = ModifyRoomsIntents(roomIntents, modifiedRoomsObjects, users)

    const previous = fs.existsSync('./roomsObjects.json') ? JSON.parse(fs.readFileSync('./roomsObjects.json', 'utf8')) : handleServerStats(users, modifiedRoomsObjects);
    const current = handleServerStats(users, modifiedRoomsObjects);

    const result = loopThrough(previous, current).current;
    if (result !== undefined) fs.writeFileSync('./roomsObjects.json', JSON.stringify(result));
  } catch (error) {
    log(error, "error.log")
  }
}