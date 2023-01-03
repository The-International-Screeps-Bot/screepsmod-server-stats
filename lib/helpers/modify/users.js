module.exports = function modifyUsers(users) {
    return users.reduce((filteredUsers, user) => {
        if (user.active !== 10000) return filteredUsers;
        delete user.salt;
        delete user.password;
        delete user.steam;
        delete user.authTouched;
        filteredUsers.push(user);
        return filteredUsers;
    }, []);
}