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
            
            const intentStats = {}
            if (statsLevel >= 1) {
                intentStats["energyInflow"] = room["energyInflow"]
                intentStats["energyOutflow"] = room["energyOutflow"]
                intentStats["fatigueDecreased"] = room["fatigueDecreased"]
                intentStats["intentCounts"] = room["intentCounts"]
                intentStats["spawnCost"] = room["spawnCost"]
            }

            if (!stats[username]) stats[username] = {}
            stats[username][roomName] = intentStats
        }
    }

    return stats;
}