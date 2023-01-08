
module.exports = function (config) {
  if (config.backend) require('./backend')(config) // API and CLI stuff
  if (config.engine) require('./engine')(config) // Engine stuff
}

// const fs = require('fs');
// const convertRoomsObjects = require('./helpers/convertRoomsObjects');
// convertRoomsObjects(JSON.parse(fs.readFileSync('test/users.json', 'utf8')), JSON.parse(fs.readFileSync('test/roomsObjects.json', 'utf8')), JSON.parse(fs.readFileSync('test/roomsIntents.json', 'utf8')))
