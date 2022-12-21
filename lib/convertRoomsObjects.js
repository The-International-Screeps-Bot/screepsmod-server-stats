const fs = require('fs');
const loopThrough = require("./functions");
const log = require('log-to-file');

function objectFilter(obj, predicate) {
  const result = {};

  for (const key of Object.keys(obj)) {
    if (predicate(obj[key])) {
      result[key] = obj[key];
    }
  }

  return result;
}

function groupObjectByKey(object, key) {
  const groups = new Map();

  for (const [id, obj] of Object.entries(object)) {
    const group = obj[key];
    if (group === undefined) continue;

    if (!groups.has(group)) {
      groups.set(group, {});
    }
    groups.get(group)[id] = obj;
  }

  return groups;
}

function HandleUserStats(user) {
  return {
    badge: user.badge,
    _id: user._id,
    username: user.username,
    bot: user.bot,
    cpu: user.cpu,
    cpuAvailable: user.cpuAvailable,
    gcl: user.gcl,
    lastUsedCpu: user.lastUsedCpu,
    lastUsedDirtyTime: user.lastUsedDirtyTime,
    rooms: user.rooms,
    steam: user.steam,
  }
  return user;
}

function HandleRoomStats(stats, objects) {
  stats.structureCounts = {
    spawn: 0,
    extension: 0,
    wall: 0,
    rampart: 0,
    link: 0,
    storage: 0,
    tower: 0,
    observer: 0,
    power_spawn: 0,
    extractor: 0,
    lab: 0,
    terminal: 0,
    container: 0,
    nuker: 0,
    factory: 0
  }
  stats.creepCounts = 0
  stats.droppedEnergy = 0
  stats.creepBodies = {
    move: 0,
    work: 0,
    carry: 0,
    attack: 0,
    ranged_attack: 0,
    tough: 0,
    heal: 0,
    claim: 0
  }
  const stores = {
    energy: 0
  }
  stats.creepStore = { ...stores }
  stats.tombstoneStore = { ...stores }
  stats.structureStore = {}
  const structureKeys = Object.keys(stats.structureCounts)
  // use for
  for (let i = 0; i < structureKeys.length; i += 1) {
    stats.structureStore[structureKeys[i]] = { ...stores }
  }
  stats.constructionSites = {
    count: 0,
    progress: 0,
    total: 0
  }
  stats.controller = {
    level: 0,
    progress: 0,
    progressTotal: 0
  }
  stats.mineralAmount = 0

  for (let i = 0; i < objects.length; i += 1) {
    const object = objects[i]
    if (structureKeys.includes(object.type)) {
      stats.structureCounts[object.type] += 1
      const resourceEntries = Object.entries(object.store)
      for (let i = 0; i < resourceEntries.length; i += 1) {
        const [resource, count] = resourceEntries[i]
        const structureStores = stats.structureStore[object.type]
        if (structureStores[resource] !== undefined) {
          structureStores[resource] += count
        }
      }
    }
    switch (object.type) {
      case 'creep':
        stats.creepCounts += 1
        const bodyEntries = Object.entries(object.body)
        for (let i = 0; i < bodyEntries.length; i += 1) {
          const [part, count] = bodyEntries[i]
          stats.creepBodies[part] += count
        }

        const resourceEntries = Object.entries(object.store)
        for (let i = 0; i < resourceEntries.length; i += 1) {
          const [resource, count] = resourceEntries[i]
          if (stats.creepStore[resource] !== undefined) { stats.creepStore[resource] += count }
        }
        break
      case 'energy':
        stats.droppedEnergy += object.energy
        break
      case 'constructionSite':
        stats.constructionSites.count += 1
        stats.constructionSites.progress += object.progress
        stats.constructionSites.total += object.progressTotal
        break
      default:
        break
    }
  }
  return stats
}
function HandleOwnedRoomStats(stats, objects) {
  for (let i = 0; i < objects.length; i += 1) {
    const object = objects[i]
    switch (object.type) {
      case 'controller':
        stats.controller = {
          level: object.level,
          progress: object.progress,
          progressTotal: object.progressTotal
        }
        break
      case 'mineral':
        stats.mineralAmount = object.mineralAmount
        break
      default:
        break
    }
  }
  return stats
}
function HandleReservedRoomStats(stats) {
  return stats
}

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
      roomStats = HandleRoomStats(roomStats, objectsValues)
      roomStats = HandleOwnedRoomStats(roomStats, objectsValues)
      ownedRooms[room] = roomStats
    }

    for (const room of groupedReservedObjects.keys()) {
      const objects = groupedReservedObjects.get(room)
      let roomStats = {}
      roomStats = HandleRoomStats(roomStats, objects)
      roomStats = HandleReservedRoomStats(roomStats)
      reservedRooms[room] = roomStats
    }

    stats[user.username] = {
      user: HandleUserStats(user),
      owned: ownedRooms,
      reserved: reservedRooms
    }
  }

  if (Object.keys(stats).length === 0) {
    return undefined
  }
  return stats
};

function modifyRoomObjects(roomObjects) {
  const updatedObjects = roomObjects.map((object) => {
    const progressTotals = {
      1: 200,
      2: 45000,
      3: 135000,
      4: 405000,
      5: 1215000,
      6: 3645000,
      7: 10935000
    };

    switch (object.type) {
      case 'controller':
        if (!object.user) break
        object.progressTotal = progressTotals[object.level] || 0;
        break
      case 'creep': {
        const countPerType = {}
        if (!object.body) break
        const body = object.body.map((p) => p.type)
        for (let p = 0; p < body.length; p += 1) {
          const part = body[p]
          if (countPerType[part] === undefined) countPerType[part] = 0
          countPerType[part] += 1
        }

        object.body = countPerType
        break
      }
      case 'mineral': object.mineralAmount = Math.round(object.mineralAmount);
      default:
        break
    }
    return object
  })

  return updatedObjects
}

module.exports = function convert(roomsObjects, users) {
  try {
    const modifiedRoomsObjects = modifyRoomObjects(roomsObjects)
    const previous = fs.existsSync('./roomsObjects.json') ? JSON.parse(fs.readFileSync('./roomsObjects.json', 'utf8')) : handleServerStats(users, modifiedRoomsObjects);
    const current = handleServerStats(users, modifiedRoomsObjects);
    const result = loopThrough(previous, current).current;
    if (result !== undefined) fs.writeFileSync('./roomsObjects.json', JSON.stringify(result));
  } catch (error) {
    console.log(error)
    log(error, "error.log")
  }
}