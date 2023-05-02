# screepsmod-server-stats

This tool allows you to execute CLI commands on a Screeps server and export the results via an API.

**Note:** If you enable raw exports and set the `secret_key` in `config.yml`, you will have access to all raw data from the server. This can be harmful if not used correctly. It is recommended to only use this feature if you know what you're doing. If you have any questions, contact PANDA#3000 on Discord.

## Security

By default, this mod is secure. Raw data exports are not enabled unless the mod is configured twice in the `config.yml` file. This means that you can only access the default endpoints. To access raw data, you must set the `secret_key` in `config.yml` and set `rawExports` to `true`. The `secret_key` must also be included in the header of the request to authorize access.

It is not recommended to enable debug mode as it will add user ID, steam, and password information to the user object export. This is only for debugging purposes and is not necessary for the mod to function.

## Installation

1. Add the following to your `mods`:

```json
"screepsmod-server-stats"
```

To enable all API endpoints, add the following to your config.yml:

```yml
serverStats: 
  debug: false
  rawExports: true
  secret_key: "an_secure_secret"
  userStats: 2
  roomsObjectsStats: 2
  roomsIntentsStats: 2
  runEveryTicks: 10
```

- `debug`: when set to `true`, turns on debug mode (not recommended)
- `rawExports`: when set to `true`, enables raw data exports (not recommended)
- `secret_key`: sets the secret key for API calls to authorize access
- `usersStats`: 0 = off, 1 = low, 2 = all
- `roomsObjectsStats`: 0 = off, 1 = low, 2 = all
- `roomsIntentsStats`: 0 = off, 1 = low, 2 = all

Make sure to include the `serverStats` object at the same depth as the `mod` and `steamKey` objects.

## Usage

The following API calls can be made if enabled in the `config.yml` file. All API calls that require access to raw data exports must include the `secret_key` in the header of the request to authorize access.

By default, the following endpoints are enabled:

- `/api/stats/server`: returns a list of all averaged server stats
- `/api/stats/version`: returns the current version of the mod
Rooms:

- `/api/stats/rooms`: returns a list of all rooms
- `/api/stats/rooms/objects`: returns a list of all rooms objects
- `/api/stats/rooms/intents`: returns a list of all rooms intents
- `(disabled) /api/rooms/flags`: returns a list of all rooms flags
- `/api/stats/rooms/terrain`: returns a list of all rooms terrain
Users:

- /api/users: returns a list of all users
- (disabled) `/api/users/console`: returns a list of
