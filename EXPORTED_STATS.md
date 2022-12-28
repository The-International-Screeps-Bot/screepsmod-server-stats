# Structure of exported stats

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

## Rooms Objects

### All

- structureCounts: { [type: string]: number }
- creepCounts: number
- droppedEnergy: number
- creepParts: { [type: string]: {
    - count: number,
    - activeParts: number } }
- creepStore: { [type: string]: number }
- tombstoneStore: { [type: string]: number }
- ruinStore: { [type: string]: number }
- structureStore: { [type: string]: { [type: string]: number } }
- constructionSites: {
    - count: number,
    - progress: number,
    - progressTotal: number }
- sources: {
    - count: number,
    - energy: number,
    - energyCapacity: number }

### Owned

- controller: {
    - level: number,
    - progress: number,
    - progressTotal: number,
    - safeModeAvailable: number,
    - safeModeCooldown: number,
    - ticksToDowngrade: number }
- mineral: {
    - type: string,
    - density: number,
    - amount: number }
- spawning (uptime): number

## Rooms intents

- IntentCounts: { [type: string]: number }
- fatigueDecreased: number
- averageSpawnCost: number
- energyOutflow: {
    - upgradeController: number,
    - build: number,
    - repair: number,
    - withdraw: { [type: string]: number }, }
- energyInflow: {
    - harvest: number,
    - transfer: { [type: string]: number }, }
