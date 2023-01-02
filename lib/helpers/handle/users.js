const modifyUsers = require('../modify/users');
const prepareUsers = require('../prepare/users');

module.exports = function handleUsers(users, statsLevel) {
    const modifiedUsers = modifyUsers(users);
    const preparedUsers = prepareUsers(modifiedUsers);
    
    const stats = {}
    const usernames = Object.keys(preparedUsers)
    for (let u = 0; u < usernames.length; u++) {
        const username = usernames[u];
        const user = preparedUsers[username]
        let userStats = {}

        if (statsLevel >= 1) {
            userStats['cpu'] = user['cpu']
            userStats['gcl'] = user['gcl']
            userStats['cpuAvailable'] = user['cpuAvailable']
            userStats['username'] = user['username']
        }
        if (statsLevel >= 2) {
            userStats['bot'] = user['bot']
            userStats["badge"] = user["badge"]
            userStats["lastUsedCpu"] = user["lastUsedCpu"]
            userStats["lastUsedDirtyTime"] = user["lastUsedDirtyTime"]
        }
        stats[username] = userStats
    }
    return stats;
}