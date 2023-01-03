const { controllerProgressTotals } = require('../constants')
const { objectFilter, groupObjectByKey } = require("../functions")

module.exports = function modifyRoomsObjects(users, roomObjects) {
  const updatedRoomsObjects = roomObjects.map((object) => {
    switch (object.type) {
      case 'controller':
        if (!object.user) break
        object.progressTotal = controllerProgressTotals[object.level] || 0;
        if (object.safeModeCooldown === null) object.safeModeCooldown = 0;
        if (object.safeModeAvailable === null) object.safeModeAvailable = 0;
        break
      case 'creep': {
        const countPerType = {}
        if (!object.body) break
        const body = object.body
        for (let p = 0; p < body.length; p += 1) {
          const part = body[p]
          if (!countPerType[part.type]) countPerType[part.type] = { count: 0, activeParts: 0 }
          countPerType[part.type].count += 1
          if (part.hits > 0) countPerType[part.type].activeParts += 1
        }

        object.body = countPerType
        break
      }
      case 'mineral':
        object.mineralAmount = Math.round(object.mineralAmount);
        break;
      case 'spawn':
        object.spawning = object.spawning !== null ? 1 : 0;
        break;
      default:
        break
    }
    return object
  })

  const ownedControllers = objectFilter(
    updatedRoomsObjects,
    (c) => c.type === 'controller' && c.user
  )
  const reservedControllers = objectFilter(
    updatedRoomsObjects,
    (c) => c.type === 'controller' && c.reservation
  )
  const roomsByUser = {}

  for (let i = 0; i < users.length; i += 1) {
    const user = users[i]
    const ownedRoomNames = Object.values(
      objectFilter(ownedControllers, (c) => c.user === user._id)
    ).map((c) => c.room)
    const reservedRoomNames = Object.values(
      objectFilter(reservedControllers, (c) => c.reservation.user === user._id)
    ).map((c) => c.room)

    const ownedObjects = objectFilter(updatedRoomsObjects, (o) =>
      ownedRoomNames.includes(o.room)
    )
    const reservedObjects = objectFilter(updatedRoomsObjects, (o) =>
      reservedRoomNames.includes(o.room)
    )

    const groupedOwnedObjects = groupObjectByKey(ownedObjects, 'room')
    const groupedReservedObjects = groupObjectByKey(reservedObjects, 'room')

    const ownedRooms = {}
    const reservedRooms = {}
    for (const room of groupedOwnedObjects.keys()) {
      const objects = groupedOwnedObjects.get(room)
      const objectsValues = Object.values(objects)
      ownedRooms[room] = objectsValues
    }
    for (const room of groupedReservedObjects.keys()) {
      const objects = groupedReservedObjects.get(room)
      const objectsValues = Object.values(objects)
      reservedRooms[room] = objectsValues
    }
    roomsByUser[user.username] = { owned: ownedRooms, reserved: reservedRooms }
  }

  return roomsByUser
}