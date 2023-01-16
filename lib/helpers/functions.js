const fs = require('fs');
const YAML = require('yamljs')
const log = require('log-to-file');

function exponentialMovingAverage(newValue, prevEMA, weight) {
    weight = 1 / weight;
    let ema = (newValue * weight) + (prevEMA * (1 - weight));

    ema = Math.round(ema * 100000) / 100000;

    return ema;
}

function loopThrough(previous, current, runEveryTicks) {
    const typeofCurrent = typeof current
    if (Array.isArray(current)) {
        for (const element of current) {
            if (previous === undefined) previous = [];
            const objects = loopThrough(previous[element], current[element], runEveryTicks);
            previous[element] = objects.previous;
            current[element] = objects.current;
        }
    } else if (typeofCurrent === 'object') {
        for (const key of Object.keys(current)) {
            if (Object.hasOwnProperty.call(current, key)) {
                if (previous === undefined) previous = {};
                const objects = loopThrough(previous[key], current[key], runEveryTicks);
                previous[key] = objects.previous;
                current[key] = objects.current;
            }
        }
    }
    else if (typeofCurrent === 'number') {
        current = exponentialMovingAverage(current, previous, Math.round(1500 / runEveryTicks));
    }
    return { previous, current }
}

function getIntentEffect(intentType, activePartCount, intentDetails) {
    let baseEffect = 0;
    switch (intentType) {
        default:
            if (!fs.existsSync('intents.txt')) fs.writeFileSync('intents.txt', '')
            if (!fs.readFileSync('intents.txt').toString().includes(intentType)) fs.appendFileSync('intents.txt', intentType + '\n' + JSON.stringify(intentDetails) + '\n\n')
            break;
    }

    return baseEffect * activePartCount;
}

function objectFilter(obj, predicate) {
    const result = {};

    for (const key of Object.keys(obj)) {
        if (predicate(obj[key])) {
            result[key] = obj[key];
        }
    }

    return result;
}

function groupObjectByKey(object, key) {
    const groups = new Map();

    for (const [id, obj] of Object.entries(object)) {
        const group = obj[key];
        if (group === undefined) continue;

        if (!groups.has(group)) {
            groups.set(group, {});
        }
        groups.get(group)[id] = obj;
    }

    return groups;
}

function getCreepCost(body) {
    const BODYPART_COST = {
        "move": 50,
        "work": 100,
        "attack": 80,
        "carry": 50,
        "heal": 250,
        "ranged_attack": 150,
        "tough": 10,
        "claim": 600
    };

    let cost = 0;
    for (const part of body) {
        cost += BODYPART_COST[part];
    }
    return cost;
}

const defaultConfig = { rawExports: false, usersStats: 2, roomsObjectsStats: 2, roomsIntentsStats: 2, runEveryTicks: 50, relayPort: 2003 }
function getConfig() {
    try {
        let filename
        const configFiles = ['config.yml', 'config.yaml']
        for (const file of configFiles) {
            try {
                fs.statSync(file)
                filename = file
            } catch (_) { }
        }
        if (!filename) return defaultConfig;

        const yaml = fs.readFileSync(filename, 'utf8')
        const serverConfig = YAML.parse(yaml)
        return serverConfig.serverStats
    } catch (error) {
        log(error, 'error_backend.log')
    }
}

function getMicroTimestamp() {
    const hrTime = process.hrtime()
    return hrTime[0] * 1000000 + hrTime[1] / 1000
}

async function getUsers(query) {
    const start = getMicroTimestamp()
    const users = await query
    log(`Found ${users.length} users in ${Math.round(getMicroTimestamp() - start)} microseconds`, 'engine.log')
    return users
}
async function getRoomsObjects(query) {
    const start = getMicroTimestamp()
    const roomsObjects = await query
    log(`Found ${roomsObjects.length} rooms objects in ${Math.round(getMicroTimestamp() - start)} microseconds`, 'engine.log')
    return roomsObjects
}
async function getRoomsIntents(query) {
    const start = getMicroTimestamp()
    const roomsIntents = await query
    log(`Found ${roomsIntents.length} rooms intents in ${Math.round(getMicroTimestamp() - start)} microseconds`, 'engine.log')
    return roomsIntents
}

function getDefaultRoomIntentStats() {
    return {
        intentCounts: {},
        fatigueDecreased: 0,
        spawnCost: 0,
        energyOutflow: {
            upgradeController: 0,
            build: 0,
            repair: 0,
            withdraw: {
                energy: 0
            },
            pickup: {
                energy: 0
            },
        },
        energyInflow: {
            harvest: 0,
            transfer: { energy: 0 },
            drop: { energy: 0 },
        },
    }
}

function setDefaultRoomStatsOnMissingRooms(previous, current) {
    const previousUsers = Object.keys(previous.users)
    for (let i = 0; i < previousUsers.length; i++) {
        const username = previousUsers[i];
        const previousRooms = Object.keys(previous.users[username].rooms)
        for (let r = 0; r < previousRooms.length; r++) {
            const roomName = previousRooms[r];
            if (!previous.users[username].rooms[roomName].intents) continue;
            if (!current.users[username]) current.users[username] = { rooms: {} }
            if (!current.users[username].rooms[roomName]) current.users[username].rooms[roomName] = {}
            const currentRoom = current.users[username].rooms[roomName]
            const previousRoom = previous.users[username].rooms[roomName]

            if (!currentRoom.intents) {
                if (!previousRoom.intents.lastSeen) previousRoom.intents.lastSeen = 0;
                previousRoom.intents.lastSeen += 1;
                if (previousRoom.intents.lastSeen < 5000) {
                    currentRoom.intents = getDefaultRoomIntentStats();
                    currentRoom.intents.lastSeen = previousRoom.intents.lastSeen;
                }
            }
        }
    }

    return current;
}

function getGCL(level) {
    if (!level) {
        const pointsNeeded = []
        for (let index = 0; index < 100; index++) {
            pointsNeeded.push(Math.pow(index, 2.4) * 100000);
        }
        return pointsNeeded;
    }

    return (Math.pow(level, 2.4) * 100000) - (Math.pow(level - 1, 2.4) * 100000);
}

function getGCLLevel(points) {
    const pointsNeeded = getGCL()
    for (let index = 0; index < pointsNeeded.length; index++) {
        if (pointsNeeded[index] > points) return index;
    }
    return 100;
}

module.exports = {
    loopThrough,
    getIntentEffect,
    objectFilter,
    groupObjectByKey,
    getCreepCost,
    getConfig,
    exponentialMovingAverage,
    getMicroTimestamp,
    getUsers,
    getRoomsObjects,
    getRoomsIntents,
    getDefaultRoomIntentStats,
    setDefaultRoomStatsOnMissingRooms,
    getGCL,
    getGCLLevel
}