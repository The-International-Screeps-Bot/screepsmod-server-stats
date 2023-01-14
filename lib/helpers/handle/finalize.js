const { getGCL, getGCLLevel } = require('../functions.js')

function updateRoomIntentsUserOverview(overview, stats) {
    return overview;
}
function updateRoomObjectsUserOverview(overview, stats) {
    if (!overview.structureCounts) overview.structureCounts = {}
    Object.entries(stats.structureCounts).forEach(([structureType, count]) => {
        overview.structureCounts[structureType] = (overview.structureCounts[structureType] || 0) + count;
    })
    if (stats.controller) overview.combinedRCL = (overview.combinedRCL || 0) + stats.controller.level;
    overview.constructionSitesCount = (overview.constructionSitesCount || 0) + stats.constructionSites.count;
    overview.creepCount = (overview.creepCount || 0) + stats.creepCount;
    overview.sourceCapacityTotal = (overview.sourceCapacityTotal || 0) + stats.sources.energyCapacity;
    overview.droppedEnergyTotal = (overview.droppedEnergyTotal || 0) + stats.droppedEnergy;

    return overview;
}
function updateUserOverview(overview, stats) {
    const gclLevel = getGCLLevel(stats.gcl)
    overview.gcl = {level: gclLevel, progress: stats.gcl, progressTotal: getGCL(gclLevel)}

    return overview;
}

module.exports = function finalizeHandleStats(users, roomsObjects, roomsIntents) {
    const stats = {}

    const usernames = Object.keys(users)
    for (let u = 0; u < usernames.length; u++) {
        const username = usernames[u];
        stats[username] = {
            rooms: {},
            ...users[username],
        }
        let overviewStats = {}

        const intentRoomNames = Object.keys(roomsIntents[username] || {}) || []
        for (let r = 0; r < intentRoomNames.length; r++) {
            const roomName = intentRoomNames[r];
            const intentStats = roomsIntents[username][roomName]
            if (!stats[username].rooms[roomName]) stats[username].rooms[roomName] = {}
            stats[username].rooms[roomName].intents = intentStats
            overviewStats = updateRoomIntentsUserOverview(overviewStats, intentStats)
        }

        const objectRoomTypes = Object.keys(roomsObjects[username] || {}) || []
        for (let o = 0; o < objectRoomTypes.length; o++) {
            const roomType = objectRoomTypes[o];
            const objectRoomNames = Object.keys(roomsObjects[username][roomType] || [])
            for (let r = 0; r < objectRoomNames.length; r++) {
                const roomName = objectRoomNames[r];
                const objectStats = roomsObjects[username][roomType][roomName]
                if (!stats[username].rooms[roomName]) stats[username].rooms[roomName] = { objects: {} }
                else if (!stats[username].rooms[roomName].objects) stats[username].rooms[roomName].objects = {}
                stats[username].rooms[roomName].objects[roomType] = objectStats
                overviewStats = updateRoomObjectsUserOverview(overviewStats, objectStats)
            }
        }
        stats[username].overview = updateUserOverview(overviewStats, users[username])
    }

    return { users: stats }
}