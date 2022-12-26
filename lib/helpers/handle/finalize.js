module.exports = function finalizeHandleStats(users, roomsObjects, roomsIntents) {
    users = users.map(user => {
        delete user._id
        return user
    })
    
    const stats = {}
    return stats
}