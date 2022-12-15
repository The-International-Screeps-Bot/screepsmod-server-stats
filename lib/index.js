module.exports = function (config) {
  if (config.backend) require('./backend')(config) // API and CLI stuff
  if (config.engine) require('./engine')(config) // Engine stuff
}
