const modifyRoomsIntents = require('../modify/roomsIntents');
const prepareRoomsIntents = require('../prepare/roomsIntents');

module.exports = function handleRoomsIntents(users, roomsObjects, roomsIntents, statsLevel) {
    const modifiedRoomsIntents = modifyRoomsIntents(users, roomsObjects, roomsIntents);
    const preparedRoomsIntents = prepareRoomsIntents(modifiedRoomsIntents);
    
    const stats = {}
    const usernames = Object.keys(preparedRoomsIntents)
    for (let u = 0; u < usernames.length; u++) {
        const username = usernames[u];
        const user = preparedRoomsIntents[username]
        const roomNames = Object.keys(user)
        for (let r = 0; r < roomNames.length; r++) {
            const roomName = roomNames[r];
            const room = user[roomName]
            const objectTypes = Object.keys(room)
            for (let o = 0; o < objectTypes.length; o++) {
                const objectType = objectTypes[o];
                const object = room[objectType]
                const intentTypes = Object.keys(object)
                for (let i = 0; i < intentTypes.length; i++) {
                    const intentType = intentTypes[i];
                    const intent = object[intentType]
                    const intentStats = {}

                    if (!stats[username]) stats[username] = {}
                    if (!stats[username][roomName]) stats[username][roomName] = {}
                    if (!stats[username][roomName][objectType]) stats[username][roomName][objectType] = {}

                    if (statsLevel >= 1) {
                        intentStats["energyInflow"] = intent["energyInflow"]
                        intentStats["energyOutflow"] = intent["energyOutflow"]
                        intentStats["fatigueDecreased"] = intent["fatigueDecreased"]
                        intentStats["intentCounts"] = intent["intentCounts"]
                        intentStats["spawnCost"] = intent["spawnCost"]
                    }
                    if (!stats[username][roomName][objectType][intentType]) stats[username][roomName][objectType][intentType] = intentStats
                }
            }
        }
    }

    return stats;
}