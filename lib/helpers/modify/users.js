module.exports = function modifyUsers(users) {
    return users.map(user => {
        delete user.salt;
        delete user.password;
        delete user.steam;
        delete user.authTouched;
        return user;
    })
}