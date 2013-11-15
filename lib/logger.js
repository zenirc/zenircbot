var winston = require('winston')
  , path = require('path')

var global_logger = new (winston.Logger)({
  transports: [
    new (winston.transports.Console)({
      level: 'debug'
    , colorize: true
    , timestamp: true
    })
  , new (winston.transports.File)({
      filename: 'zenircbot.log'
    , level: 'info'
    })
  ]
})

function get_logger(file) {
  var process_dir = path.dirname(process.argv[1])
    , filename = path.relative(process_dir, file)
    , logger = {}

  logger.debug = function (msg) {
    global_logger.log('debug', filename + ': ' + JSON.stringify(msg))
  }
  logger.info = function (msg) {
    global_logger.log('info', filename + ': ' + JSON.stringify(msg))
  }
  logger.warn = function (msg) {
    global_logger.log('warn', filename + ': ' + JSON.stringify(msg))
  }
  logger.error = function (msg) {
    global_logger.log('error', filename + ': ' + JSON.stringify(msg))
  }
  return logger
}

module.exports = get_logger
