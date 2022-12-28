const modifyRoomsIntents = require('../modify/roomsIntents');
const prepareRoomsIntents = require('../prepare/roomsIntents');

module.exports = function handleRoomsIntents(users, roomsObjects, roomsIntents) {
    const modifiedRoomsIntents = modifyRoomsIntents(users, roomsObjects, roomsIntents);
    const preparedRoomsIntents = prepareRoomsIntents(modifiedRoomsIntents);

    return preparedRoomsIntents; 
}