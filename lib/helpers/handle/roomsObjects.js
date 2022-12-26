const modifyRoomsObjects = require('../modify/roomsObjects');
const prepareRoomsObjects = require('../prepare/roomsObjects');

module.exports = function HandleRoomsObjectsStats(usersObjects, roomsObjects) {
    const modifiedRoomsObjects = modifyRoomsObjects(usersObjects, roomsObjects);
    const preparedRoomsObjects = prepareRoomsObjects(modifiedRoomsObjects);

    return preparedRoomsObjects;
}