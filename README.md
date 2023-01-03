# screepsmod-server-stats

## This is an tool to get cli commands executed on screeps server and exported via API

Small note:

If you turn on raw exports and set the secret_key in config.yml you will get access to all the raw data from the server. This could mean harm for your server if not used correctly. I recommend to only use this if you know what you are doing. Contact me on discord if you have any questions. PANDA#3000

## Security

This mod is secure by default, without being enabled 2 times in mod config the raw data exports are not enabled. This means that you can only get the default endpoints. If you want to get access to the raw data you need to set the secret_key in config.yml and set rawExports to true. This will enable the raw data exports and you will need to include the secret_key in the header of the request to get access.

Debug mode is not advised to turn on because this will add id, steam and password info to the user object export. This is not needed for the mod to work and is only for debugging purposes.

## Installation

1. Add the following to your `mods`:

```json
"screepsmod-server-stats"
```

2. To turn on all the api endpoints add the following to your `config.yml`:

```json
serverStats: 
  debug: false
  rawExports: true
  secret_key: "an_secure_secret"
  userStats: 2
  roomsObjectsStats: 2
  roomsIntentsStats: 2
```

* debug: false - turns on debug mode (not advised)
* rawExports: true - turns on raw exports (not advised)
* secret_key: "an_secure_secret" - sets the secret key for the api calls to authorize
* usersStats: 2 - 0 = off, 1 = low, 2 = all
* roomsObjectsStats: 2 - 0 = off, 1 = low, 2 = all
* roomsIntentsStats: 2 - 0 = off, 1 = low, 2 = all

Include object on same depth as mod & steamKey object.

## Usage

The following api calls can be made (if turned on)
All api calls expect default endpoints require to be enabled in mod config.yml by setting an secret_key and rawExports value (see installation) otherwise you will get access denied always.

Don't forget to include the secret_key in the header of the request to get access.

Default on is:

* /api/stats/server - returns a list of all averaged server stats
* /api/stats/version - returns the current version of the mod

Rooms:

* /api/rooms - returns a list of all rooms
* /api/rooms/objects - returns a list of all rooms objects
* /ap/rooms/intents - returns a list of all rooms intents
* /api/rooms/flags - returns a list of all rooms flags
* /api/rooms/terrain - returns a list of all rooms terrain

Users:

* /api/users - returns a list of all users
* **(disabled)** /api/users/console - returns a list of all users console
* **(disabled)** /api/users/money - returns a list of all users money
* **(disabled)** /api/users/notifications - returns a list of all users notifications
* **(disabled)** /api/users/resources - returns a list of all users resources
* /api/users/power_creeps - returns a list of all users power_creeps

Market:

* **(disabled)** /api/market/transactions - returns a list of all market transactions
