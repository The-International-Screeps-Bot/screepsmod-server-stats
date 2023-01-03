const { controllerProgressTotals } = require('../constants');

module.exports = function modifyRoomsObjects(users, roomObjects) {
  const updatedRoomsObjects = roomObjects.map((object) => {
    switch (object.type) {
      case 'controller': {
        if (!object.user) break;
        object.progressTotal = controllerProgressTotals[object.level] || 0;
        object.safeModeCooldown = object.safeModeCooldown || 0;
        object.safeModeAvailable = object.safeModeAvailable || 0;
        break;
      }
      case 'creep': {
        if (!object.body) break;
        const countPerType = object.body.reduce((acc, part) => {
          if (!acc[part.type]) acc[part.type] = { count: 0, activeParts: 0 };
          acc[part.type].count += 1;
          if (part.hits > 0) acc[part.type].activeParts += 1;
          return acc;
        }, {});
        object.body = countPerType;
        break;
      }
      case 'mineral': {
        object.mineralAmount = Math.round(object.mineralAmount);
        break;
      }
      case 'spawn': {
        object.spawning = object.spawning !== null ? 1 : 0;
        break;
      }
      default:
        break;
    }
    return object;
  });

  const ownedControllers = updatedRoomsObjects.filter(
    (c) => c.type === 'controller' && c.user
  );
  const reservedControllers = updatedRoomsObjects.filter(
    (c) => c.type === 'controller' && c.reservation
  );
  const roomsByUser = {};

  for (const user of users) {
    const ownedRoomNames = Object.values(
      ownedControllers.filter((c) => c.user === user._id)
    ).map((c) => c.room);
    const reservedRoomNames = Object.values(
      reservedControllers.filter((c) => c.reservation.user === user._id)
    ).map((c) => c.room);

    const ownedObjects = updatedRoomsObjects.filter((o) =>
      ownedRoomNames.includes(o.room)
    );
    const reservedObjects = updatedRoomsObjects.filter((o) =>
      reservedRoomNames.includes(o.room)
    );

    const groupedOwnedObjects = ownedObjects.reduce((acc, obj) => {
      const { room } = obj;
      if (!acc[room]) acc[room] = {};
      acc[room][obj._id] = obj;
      return acc;
    }, {});
    const groupedReservedObjects = reservedObjects.reduce((acc, obj) => {
      const { room } = obj;
      if (!acc[room]) acc[room] = {};
      acc[room][obj._id] = obj;
      return acc;
    }, {});

    roomsByUser[user.username] = {
      owned: groupedOwnedObjects,
      reserved: groupedReservedObjects,
    };
    return roomsByUser;
  }
}