const modifyUsers = require('../modify/users');
const prepareUsers = require('../prepare/users');

module.exports = function handleUsers(users) {
    const modifiedUsers = modifyUsers(users);
    const preparedUsers = prepareUsers(modifiedUsers);

    return preparedUsers;
}