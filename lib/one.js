var logger = require('./logger')(__filename)

module.exports = function(bot, message) {
  switch (message.type) {
    case 'privmsg':
      logger.info('privmsg: ' + JSON.stringify(message))
      bot.say(message.data.to, message.data.message)
      break

    case 'privmsg_action':
      logger.info('privmsg_action: ' + JSON.stringify(message))
      bot.action(message.data.to, message.data.message)
      break

    case 'raw':
      logger.info('raw: ' + JSON.stringify(message))
      bot.send(message.command)
      break
  }
}