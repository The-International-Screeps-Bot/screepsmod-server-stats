module.exports = function HandleUsersStats(user) {
    return {
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