const modifyRoomsObjects = require('../modify/roomsObjects');
const prepareRoomsObjects = require('../prepare/roomsObjects');

module.exports = function HandleRoomsObjectsStats(usersObjects, roomsObjects, statsLevel) {
    const modifiedRoomsObjects = modifyRoomsObjects(usersObjects, roomsObjects);
    const preparedRoomsObjects = prepareRoomsObjects(modifiedRoomsObjects);

    const stats = {}
    const usernames = Object.keys(preparedRoomsObjects)
    for (let u = 0; u < usernames.length; u++) {
        const username = usernames[u];
        const user = preparedRoomsObjects[username]
        const roomTypes = Object.keys(user)
        for (let t = 0; t < roomTypes.length; t++) {
            const roomType = roomTypes[t];
            const roomNames = Object.keys(user[roomType])
            for (let r = 0; r < roomNames.length; r++) {
                const roomName = roomNames[r];
                const room = user[roomType][roomName]
                const roomStats = {}
                
                if (!stats[username]) stats[username] = {}
                if (!stats[username][roomType]) stats[username][roomType] = {}

                if (statsLevel >= 1) {
                    roomStats['controller'] = room['controller']
                    roomStats['constructionSites'] = room['constructionSites'];
                    roomStats['creepCounts'] = room['creepCounts']
                    roomStats['droppedEnergy'] = room['droppedEnergy']
                    roomStats['mineral'] = room['mineral']
                    roomStats['sources'] = room['sources']
                    roomStats['spawning'] = room['spawning']
                    roomStats['structureCounts'] = room['structureCounts']
                }
                if (statsLevel >= 2) {
                    roomStats['creepParts'] = room['creepParts'];
                    roomStats['creepStore'] = room['creepStore'];
                    roomStats['ruinStore'] = room['ruinStore'];
                    roomStats['structureHits'] = room['structureHits']
                    roomStats['structureStore'] = room['structureStore']
                    roomStats['tombstoneStore'] = room['tombstoneStore']
                }
                stats[username][roomType][roomName] = roomStats
            }
        }
    }
    return stats;
}