# screepsmod-server-stats

## This is an tool to get cli commands executed on screeps server and exported via API.

## Installation

Add the following to your `mods`:

```json
"screepsmod-server-stats"
```

and to turn on all the api endpoints add the following to your `config.yml`:

```json
serverStats: 
  debug: false
  rawExports: true
```

On same depth as mod & steamKey object. Only turn on DEBUG if you know what you are doing (contact me).

## Usage

The following api calls can be made (if turned on)

Default on is:

- /api/stats/server - returns a list of all averaged server stats
- /api/stats/version - returns the current version of the mod

Rooms:

- /api/rooms - returns a list of all rooms
- /api/rooms/objects - returns a list of all rooms objects
- /ap/rooms/intents - returns a list of all rooms intents
- /api/rooms/flags - returns a list of all rooms flags
- /api/rooms/terrain - returns a list of all rooms terrain

Users:

- /api/users - returns a list of all users
- (disabled) /api/users/console - returns a list of all users console
- (disabled) /api/users/money - returns a list of all users money
- /(disabled) api/users/notifications - returns a list of all users notifications
- (disabled) /api/users/resources - returns a list of all users resources
- /api/users/power_creeps - returns a list of all users power_creeps

Market:

- (disabled) /api/market/transactions - returns a list of all market transactions
