# Structure of exported stats

Overall server stats are in admin utils and will not be handled by this mod.

```json
{
    "activeUsers": "number",
    "objects": {
        "all": "number"
        "creeps": "number"
    },
    "activeRooms": "number",
    "totalRooms": "number",
    "ownedRooms": "number",
    "gametime": "number",
    "users": { 
        "username": "User (no preview)"
    },
}
```

## Overview

```json
{
    "gcl": {
        "level": "number",
        "progress": "number",
        "progressTotal": "number" 
    },
    "combinedRCL": "number",
    "structureCounts": { "type": "number" },
    "constructionSitesCount": "number",
    "creepCount": "number",
    "sourceCapacityTotal": "number",
    "droppedEnergyTotal": "number",
}
```

## Users

- Level 0: Username (key)
- Level 1:

```json
{
    "cpu": "number",
    "gcl": "number",
    "cpuAvailable": "number",
    "roomsCount": "number"
}
```

- Level 2:

```json
{
    "bot": "string",
    "badge": {
        "type": "number",
        "color1": "string",
        "color2": "string",
        "color3": "string",
        "flip": "boolean",
        "param": "number"
    },
    "lastUsedCpu": "number",
    "lastUsedDirtyTime": "number",
}
```

## Rooms Objects

### All

- Level 1:

```json
{
    "constructionSites": {
        "count": "number",
        "progress": "number",
        "progressTotal": "number" },
    "creepCounts": "number",
    "droppedEnergy": "number",
            "sources": {
        "count": "number",
        "energy": "number",
        "energyCapacity": "number" }
    "structureCounts": { "type": "number" },
}
```

- Level 2:

```json
{
    "creepParts": { "type": {
        "count": "number",
        "activeParts": "number" } },
    "creepStore": { "type": "number" },
    "tombstoneStore": { "type": "number" },
    "ruinStore": { "type": "number" },
    "structureStore": { "structureType": { "resourceType": "number" } },
    "structureHits": { "type": "number" },
}
```

### Owned

- Level 1:

```json
{
    "controller": {
        "level": "number",
        "progress": "number",
        "progressTotal": "number",
        "safeModeAvailable": "number",
        "safeModeCooldown": "number",
        "ticksToDowngrade": "number" },
    "mineral": {
        "type": "string",
        "density": "number",
        "amount": "number" },
    "spawning (uptime %)": "number",
}
```

## Rooms intents

- Level 1:

```json
{
    "energyOutflow": {
        "upgradeController": "number",
        "build": "number",
        "repair": "number",
        "withdraw": { "type": "number" },
    },
    "energyInflow": {
        "harvest": "number",
        "transfer": { "type": "number" },
    },
    "fatigueDecreased": "number",
    "spawnCost": "number",
    "intentCounts": { "type": "number" },
}
```
