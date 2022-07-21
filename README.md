# screepsmod-server-stats

## This is an tool to get cli commands executed on screeps server and exported via API.

## Installation

Add the following to your `mods`:

```json
"screepsmod-server-stats"
```

## Usage

The following api calls can be made

Rooms:

- /api/rooms - returns a list of all rooms
- /api/rooms/objects - returns a list of all rooms objects
- /ap/rooms/intents - returns a list of all rooms intents
- /api/rooms/flags - returns a list of all rooms flags
- /api/rooms/terrain - returns a list of all rooms terrain

Users:

- /api/users - returns a list of all users
- /api/users/console - returns a list of all users console
- /api/users/money - returns a list of all users money
- /api/users/notifications - returns a list of all users notifications
- /api/users/resources - returns a list of all users resources
- /api/users/power_creeps - returns a list of all users power_creeps

Market:

- /api/market/transactions - returns a list of all market transactions
