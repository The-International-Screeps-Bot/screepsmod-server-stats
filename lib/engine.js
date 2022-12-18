const log = require('log-to-file');

module.exports = function engine(config) {
  config.engine.on('init', async type => {
    const { storage: { db, env, pubsub } } = config.common
    if (type === 'main') {
      config.engine.on('mainLoopStage', async stage => {
        log((await db.users.find({})).length, 'users.txt')
      })
    }
  })
}