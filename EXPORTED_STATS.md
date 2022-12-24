# Structure of exported stats

```json
{
    username: {
        user: object,
        owned: object,
        reserved: object,
    }
}
```

## Users

- Badge
    - type: number
    - color1: string
    - color2: string
    - color3: string
    - flip: boolean
    - param: number
- username: string
- bot: string
- cpu: number
- cpuAvailable: number
- gcl: number
- lastUsedCpu: number
- lastUsedDirtyTime: number
- rooms: string[]

## Rooms

### All

- structureCounts: { [type: string]: number }
- creepCounts: number
- droppedEnergy: number
- creepParts: { [type: string]: {count: number, activeParts: number } }
- creepStore: { [type: string]: number }
- tombstoneStore: { [type: string]: number }
- ruinStore: { [type: string]: number }
- structureStore: { [type: string]: { [type: string]: number } }
- constructionSites: { count: number, progress: number, progressTotal: number }
- sources: {count: number, energy: number, energyCapacity: number }

### Owned

- controller: { level: number, progress: number, progressTotal: number, safeModeAvailable: number, safeModeCooldown: number, ticksToDowngrade: number }
- mineral: { type: string, density: number, amount: number }
- spawning (uptime): number
