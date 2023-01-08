module.exports = function modifyRoomsIntents(userList, roomsObjectList, roomsIntents) {
    const updatedIntents = {}

    roomsIntents.map(room => {
        const users = Object.entries(room.users)
        for (let u = 0; u < users.length; u++) {
            const intentUser = users[u];
            const user = userList.find((u) => u._id === intentUser[0])
            if (!user) continue;
            const username = user.username

            const objects = Object.entries(intentUser[1].objects)
            for (let i = 0; i < objects.length; i++) {
                const intentObject = objects[i];
                const object = roomsObjectList.find((o) => o._id === intentObject[0])
                if (!object) continue;
                const objectType = object.type

                const intents = Object.entries(intentObject[1])
                for (let j = 0; j < intents.length; j++) {
                    const intent = intents[j];
                    const intentType = intent[0]

                    if (!updatedIntents[username]) updatedIntents[username] = {}
                    if (!updatedIntents[username][room.room]) updatedIntents[username][room.room] = {}
                    if (!updatedIntents[username][room.room][objectType]) updatedIntents[username][room.room][objectType] = {}
                    if (!updatedIntents[username][room.room][objectType][intentType]) updatedIntents[username][room.room][objectType][intentType] = []
                    updatedIntents[username][room.room][objectType][intentType].push({intent:intent[1], object})
                }
            }
        }
    })

    return updatedIntents
}