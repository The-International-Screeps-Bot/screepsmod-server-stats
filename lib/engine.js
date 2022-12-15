const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  defaultMeta: { service: 'user-service' },
  transports: [
    //
    // - Write all logs with importance level of `error` or less to `error.log`
    // - Write all logs with importance level of `info` or less to `combined.log`
    //
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});


module.exports = function engine(config){
    let storage = config.common.storage
    config.engine.on('playerSandbox', function(sandbox,userID) {
      sandbox.example = function() {
        logger.info('Hello from example mod!');
        sandbox.console.log(`Hello from example mod!`);
      };
    });
    config.engine.on('main',function(processType){
        logger.info('22222Hello from example mod!');
        sandbox.console.log(`2222Hello from example mod!`);
        // processType will be 'runner','processor', or 'main'
      // Useful for detecting what module you are in
    })
  }