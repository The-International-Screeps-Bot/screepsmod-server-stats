module.exports = function PrepareUsersStats(users) {
  const stats = {}
  for (let u = 0; u < users.length; u++) {
    const user = users[u];
    stats[user.username] = {
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
  }
  return stats
}