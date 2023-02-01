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
                    roomStats['constructionSites'] = room['constructionSites'];
                    roomStats['creepCount'] = room['creepCount']
                    roomStats['droppedEnergy'] = room['droppedEnergy']
                    roomStats['sources'] = room['sources']
                    roomStats['structureCounts'] = room['structureCounts']
                    if (roomType === "owned") {
                        roomStats['spawning'] = room['spawning']
                        roomStats['controller'] = room['controller']
                        roomStats['mineral'] = room['mineral']
                    }
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