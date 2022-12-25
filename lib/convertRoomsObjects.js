const fs = require('fs');
const loopThrough = require("./functions");
const log = require('log-to-file');

const structureTypes = ["spawn", "extension", "wall", "rampart", "link", "storage", "tower", "observer", "powerSpawn", "extractor", "lab", "terminal", "container", "nuker", "factory"];
const creepParts = ["move", "work", "carry", "attack", "ranged_attack", "tough", "heal", "claim"];

const parts = { count: 0, activeParts: 0 }
const stores = {
  energy: 0
}

function getIntentEffect(intent, activePartCount) {
  let baseEffect = 0;
  switch (intent) {
    default:
      log("Unknown intent: " + intent, "unknownIntents.log")
      break;
  }

  return baseEffect * activePartCount;
}


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
    username: user.username,
    bot: user.bot,
    cpu: user.cpu,
    cpuAvailable: user.cpuAvailable,
    gcl: user.gcl,
    lastUsedCpu: user.lastUsedCpu,
    lastUsedDirtyTime: user.lastUsedDirtyTime,
    rooms: user.rooms,
  }
}

function HandleRoomStats(stats, objects) {
  stats.structureCounts = {}
  stats.structureStore = {}
  stats.structureHits = {}
  for (let i = 0; i < structureTypes.length; i += 1) {
    stats.structureCounts[structureTypes[i]] = 0
    stats.structureStore[structureTypes[i]] = { ...stores }
    stats.structureHits[structureTypes[i]] = 0
  }
  stats.creepCounts = 0
  stats.droppedEnergy = 0

  stats.creepParts = {}
  for (let i = 0; i < creepParts.length; i += 1) {
    stats.creepParts[creepParts[i]] = { ...parts }
  }

  stats.creepStore = { ...stores }
  stats.tombstoneStore = { ...stores }
  stats.ruinStore = { ...stores }
  stats.constructionSites = {
    count: 0,
    progress: 0,
    progressTotal: 0
  }

  stats.sources = { count: 0, energy: 0, energyCapacity: 0, ticksToRegeneration: 0 }

  for (let i = 0; i < objects.length; i += 1) {
    const object = objects[i]
    if (structureTypes.includes(object.type)) {
      stats.structureCounts[object.type] += 1
      stats.structureHits[object.type] += object.hits
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
          const [partName, part] = bodyEntries[i]
          stats.creepParts[partName].count += part.count
          stats.creepParts[partName].activeParts += part.activeParts
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
      case 'source':
        stats.sources.count += 1;
        stats.sources.energy += object.energy
        stats.sources.energyCapacity += object.energyCapacity
        break
      case 'tombstone':
        const tombstoneResourceEntries = Object.entries(object.store)
        for (let i = 0; i < tombstoneResourceEntries.length; i += 1) {
          const [resource, count] = tombstoneResourceEntries[i]
          if (stats.tombstoneStore[resource] !== undefined) { stats.tombstoneStore[resource] += count }
        }
        break
      case 'ruin':
        const ruinResourceEntries = Object.entries(object.store)
        for (let i = 0; i < ruinResourceEntries.length; i += 1) {
          const [resource, count] = ruinResourceEntries[i]
          if (stats.ruinStore[resource] !== undefined) { stats.ruinStore[resource] += count }
        }
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
          progressTotal: object.progressTotal,
          safeModeCooldown: object.safeModeCooldown,
          safeModeAvailable: object.safeModeAvailable,
          ticksToDowngrade: object.ticksToDowngrade,
        }
        break
      case 'mineral':
        stats.mineral = { amount: object.mineralAmount, density: object.density, type: object.mineralType }
        break
      case 'spawn':
        stats.spawning = object.spawning
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
        if (object.safeModeCooldown === null) object.safeModeCooldown = 0;
        if (object.safeModeAvailable === null) object.safeModeAvailable = 0;
        break
      case 'creep': {
        const countPerType = {}
        if (!object.body) break
        const body = object.body.map((p) => p.type)
        for (let p = 0; p < body.length; p += 1) {
          const part = body[p]
          if (countPerType[part] === undefined) countPerType[part] = { count: 0, activeParts: 0 }
          countPerType[part].count += 1
          if (part.hits > 0) countPerType[part].activeParts += 1
        }

        object.body = countPerType
        break
      }
      case 'mineral':
        object.mineralAmount = Math.round(object.mineralAmount);
        break;
      case 'spawn':
        object.spawning !== null ? object.spawning = true : object.spawning = false;
        break;
      default:
        break
    }
    return object
  })

  return updatedObjects
}
function modifyRoomIntents(roomIntentList, modifiedRoomsObjectList, userList) {
  const updatedIntents = {}

  for (const room of roomIntentList) {
    const users = Object.entries(room.users)
    for (let u = 0; u < users.length; u++) {
      const intentUser = users[u];
      const user = userList.find((u) => u._id === intentUser[0])
      if (!user) break;
      const username = user.username

      const objects = Object.entries(intentUser[1].objects)
      for (let i = 0; i < objects.length; i++) {
        const intentObject = objects[i];
        const object = modifiedRoomsObjectList.find((o) => o._id === intentObject[0])
        if (!object) break;
        const objectType = object.type

        const intents = Object.entries(intentObject[1])
        for (let j = 0; j < intents.length; j++) {
          const intent = intents[j];
          const intentType = intent[0]
          const effect = getIntentEffect(intentType, 1);
          if (!fs.existsSync('intents.txt')) fs.writeFileSync('intents.txt', '')
          if (!fs.readFileSync('intents.txt').toString().includes(intentType)) fs.appendFileSync('intents.txt', intentType + '\n')

          if (!updatedIntents[username]) updatedIntents[username] = {}
          if (!updatedIntents[username][room.room]) updatedIntents[username][room.room] = {}
          if (!updatedIntents[username][room.room][objectType]) updatedIntents[username][room.room][objectType] = {}
          if (!updatedIntents[username][room.room][objectType][intentType]) updatedIntents[username][room.room][objectType][intentType] = {count:0, maxEffect:0}
          updatedIntents[username][room.room][objectType][intentType].count += 1
          updatedIntents[username][room.room][objectType][intentType].maxEffect += effect
        }          
      }
    }
  }

  return updatedIntents
}

module.exports = function convert(roomsObjects, roomIntents, users) {
  try {
    const modifiedRoomsObjects = modifyRoomObjects(roomsObjects)
    const modifiedRoomIntents = modifyRoomIntents(roomIntents, modifiedRoomsObjects, users)

    const previous = fs.existsSync('./roomsObjects.json') ? JSON.parse(fs.readFileSync('./roomsObjects.json', 'utf8')) : handleServerStats(users, modifiedRoomsObjects);
    const current = handleServerStats(users, modifiedRoomsObjects);

    const result = loopThrough(previous, current).current;
    if (result !== undefined) fs.writeFileSync('./roomsObjects.json', JSON.stringify(result));
  } catch (error) {
    log(error, "error.log")
  }
}