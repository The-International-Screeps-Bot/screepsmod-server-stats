// const fs = require('fs');
// const convertRoomsObjects = require('./helpers/convertRoomsObjects');
// const { getMicroTimestamp } = require('./helpers/functions');

module.exports = function (config) {
  if (config.backend) require('./backend')(config) // API and CLI stuff
  if (config.engine) require('./engine')(config) // Engine stuff
}

// const startLoad = getMicroTimestamp()
// const users = JSON.parse(fs.readFileSync('test/users.json', 'utf8'))
// const roomsObjects = JSON.parse(fs.readFileSync('test/roomsObjects.json', 'utf8'));
// const roomsIntents = JSON.parse(fs.readFileSync('test/roomsIntents.json', 'utf8'));
// convertRoomsObjects(users, roomsObjects, roomsIntents, startLoad)