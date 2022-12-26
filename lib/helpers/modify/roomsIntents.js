const { getIntentEffect } = require('../functions')

module.exports = function modifyRoomsIntents(roomsIntentList, modifiedRoomsObjectList, userList) {
    const updatedIntents = {}
  
    for (const room of roomsIntentList) {
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
            const effect = getIntentEffect(intentType, 1, intent[1]);
  
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