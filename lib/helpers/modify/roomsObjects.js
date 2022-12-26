const { controllerProgressTotals } = require('../constants')

module.exports = function modifyRoomsObjects(roomObjects) {
    const updatedObjects = roomObjects.map((object) => {

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