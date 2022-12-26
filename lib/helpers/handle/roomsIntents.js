const modifyRoomsIntents = require('../modify/roomsIntents');
const prepareRoomsIntents = require('../prepare/roomsIntents');

module.exports = function handleRoomsIntents(users, roomsObjects, roomsIntents) {
    const modifiedRoomsIntents = modifyRoomsIntents(roomsIntentList, modifiedRoomsObjectList, userList);
    const preparedRoomsIntents = prepareRoomsIntents(modifiedRoomsIntents);

    return preparedRoomsIntents; 
}