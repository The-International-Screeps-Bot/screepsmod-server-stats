const { structureTypes, creepParts, stores, parts } = require('../constants')

function allRoomsObjectsStats(stats,objects, roomType) {
    stats.structureCounts = {}
    stats.structureStore = {}
    stats.structureHits = {}
    for (let i = 0; i < structureTypes.length; i += 1) {
        stats.structureCounts[structureTypes[i]] = 0
        stats.structureStore[structureTypes[i]] = { ...stores }
        stats.structureHits[structureTypes[i]] = 0
    }
    stats.creepCount = 0
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
        total: 0
    }

    stats.sources = { count: 0, energy: 0, energyCapacity: 0 }

    for (let i = 0; i < objects.length; i += 1) {
        const object = objects[i]
        if (structureTypes.includes(object.type)) {
            stats.structureCounts[object.type] += 1
            stats.structureHits[object.type] += object.hits
            const resourceEntries = Object.entries(object.store || {})
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
                stats.creepCount += 1
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

    switch (roomType) {
        case "owned":
            stats = ownedRoomsObjectsStats(stats, objects)
            break;
        case "reserved":
            stats = reservedRoomsObjectsStats(stats, objects)
            break;
        default:
            break;
    }

    return stats
}

function ownedRoomsObjectsStats(stats, objects) {
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
                stats.spawning = object.spawning / stats.structureCounts.spawn
                break
            default:
                break
        }
    }

    return stats
}
function reservedRoomsObjectsStats(stats) {
    return stats
}

module.exports = function prepareRoomsObjectsStats(objectsByUserByRoom, roomType) {
    const stats = {}

    for (const user in objectsByUserByRoom) {
        stats[user] = {}
        for (const roomType in objectsByUserByRoom[user]) {
            stats[user][roomType] = {}
            for (const room in objectsByUserByRoom[user][roomType]) {
                stats[user][roomType][room] = {}
                const objects = objectsByUserByRoom[user][roomType][room]
                stats[user][roomType][room] = allRoomsObjectsStats(stats[user][roomType][room], objects, roomType)
            }
        }
    }

    return stats;
}