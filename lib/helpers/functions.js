const fs = require('fs');
const YAML = require('yamljs')
const log = require('log-to-file');

function exponentialMovingAverage(newValue, prevEMA, weight = 100) {
    weight = 1 / weight;
    let ema = (newValue * weight) + (prevEMA * (1 - weight));
    
    ema = Math.round(ema * 100000) / 100000;
    
    return ema;
  }

function loopThrough(previous, current) {
    const typeofCurrent = typeof current
    if (Array.isArray(current)) {
        for (const element of current) {
            if (previous === undefined) previous = [];
            const objects = loopThrough(previous[element], current[element]);
            previous[element] = objects.previous;
            current[element] = objects.current;
        }
    } else if (typeofCurrent === 'object') {
        for (const key of Object.keys(current)) {
            if (Object.hasOwnProperty.call(current, key)) {
                if (previous === undefined) previous = {};
                const objects = loopThrough(previous[key], current[key]);
                previous[key] = objects.previous;
                current[key] = objects.current;
            }
        }
    }
    else if (typeofCurrent === 'number') {
        current = exponentialMovingAverage(current, previous);
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

const defaultConfig = {}
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

module.exports = {
    loopThrough,
    getIntentEffect,
    objectFilter,
    groupObjectByKey,
    getCreepCost,
    getConfig
}