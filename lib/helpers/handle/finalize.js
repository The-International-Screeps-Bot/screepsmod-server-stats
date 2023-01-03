module.exports = function finalizeHandleStats(users, roomsObjects, roomsIntents) {
    const stats = {}

    const usernames = Object.keys(users)
    for (let u = 0; u < usernames.length; u++) {
        const username = usernames[u];
        stats[username] = {
            rooms: {},
            ...users[username]
        }

        const intentRoomNames = Object.keys(roomsIntents[username] || [])
        for (let r = 0; r < intentRoomNames.length; r++) {
            const roomName = intentRoomNames[r];
            const intentStats = roomsIntents[username][roomName]
            if (!stats[username].rooms[roomName]) stats[username].rooms[roomName] = {intents: {}, objects: {}}
            stats[username].rooms[roomName].intents = intentStats
        }

        const objectRoomTypes = Object.keys(roomsObjects[username] || [])
        for (let o = 0; o < objectRoomTypes.length; o++) {
            const roomType = objectRoomTypes[o];
            const objectRoomNames = Object.keys(roomsObjects[username][roomType] || [])
            for (let r = 0; r < objectRoomNames.length; r++) {
                const roomName = objectRoomNames[r];
                const objectStats = roomsObjects[username][roomType][roomName]
                if (!stats[username].rooms[roomName]) stats[username].rooms[roomName] = {intents: {}, objects: {}}
                stats[username].rooms[roomName].objects[roomType] = objectStats
            }
        }
    }
    return stats
}