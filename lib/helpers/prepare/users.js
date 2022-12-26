module.exports = function PrepareUsersStats(users) {
  return users.map(user => {
    return {
      _id: user._id,
      badge: user.badge,
      username: user.username,
      bot: user.bot,
      cpu: user.cpu,
      cpuAvailable: user.cpuAvailable,
      gcl: user.gcl,
      lastUsedCpu: user.lastUsedCpu,
      lastUsedDirtyTime: user.lastUsedDirtyTime,
      rooms: user.rooms,
    }
  })
}