var logger = require('./logger')(__filename)
module.exports = function addListeners(irc, zen, bot, config) {

  irc.addListener('connect', function() {
    bot.connected = true
    if(!bot.pingLoop) {
      logger.info('Connected, starting PING request loop')
      bot.startPing(config.server.ping, config.server.hostname)
    }
    zen.redis.publish('in', JSON.stringify({
      version: 1,
      type: 'connected',
      data: {
        server: config.server.name,
        channels: config.server.channels
      }
    }))
  })

  irc.addListener('raw', function(message) {
    if(message.command === 'PONG') {
      bot.pings = 0
      logger.debug('Received PONG')
    }
  })

  irc.addListener('action', function(nick, to, text) {
    logger.info(nick + ' emoted ' + text + ' to ' + to)
    if (to === irc.nick) {
      to = nick
    }
    var msg = {
      version: 1,
      type: 'privmsg_action',
      data: {
        sender: nick,
        channel: to,
        message: text
      }
    }
    zen.redis.publish('in', JSON.stringify(msg))
  })

  irc.addListener('message', function(nick, to, text) {
    logger.info(nick + ' said ' + text + ' to ' + to)
    if (to === irc.nick) {
      to = nick
    }
    var msg = {
      version: 1,
      type: 'privmsg',
      data: {
        sender: nick,
        channel: to,
        message: text
      }
    }
    zen.redis.publish('in', JSON.stringify(msg))
  })

  irc.addListener('nick', function(oldNick, newNick) {
    logger.info('a nick changed from ' + oldNick + ' to ' + newNick)
    zen.redis.get('zenircbot:nick', function(err, nick) {
      if (!err && nick === oldNick) {
        zen.redis.set('zenircbot:nick', newNick)
      }
    })
  })

  irc.addListener('join', function(channel, nick) {
    logger.info(nick + ' joined ' + channel)
    var msg = {
      version: 1,
      type: 'join',
      data: {
        sender: nick,
        channel: channel
      }
    }
    zen.redis.publish('in', JSON.stringify(msg))
  })

  irc.addListener('part', function(channel, nick, reason) {
    logger.info(nick + ' left ' + channel + ' because ' + reason)
    var msg = {
      version: 1,
      type: 'part',
      data: {
        sender: nick,
        channel: channel
      }
    }
    zen.redis.publish('in', JSON.stringify(msg))
  })

  irc.addListener('quit', function(nick) {
    logger.info(nick + ' quit')
    var msg = {
      version: 1,
      type: 'quit',
      data: {
        sender: nick
      }
    }
    zen.redis.publish('in', JSON.stringify(msg))
  })

  irc.addListener('topic', function(channel, topic, nick) {
    logger.info(nick + ' changed the topic in ' +
                channel + ' to "' + topic + '"')
    var msg = {
      version: 1,
      type: 'topic',
      data: {
        sender: nick,
        channel: channel,
        topic: topic
      }
    }
    zen.redis.publish('in', JSON.stringify(msg))
  })

  irc.addListener('names', function(channel, nicks) {
    logger.info('Names: '+channel + ' ' + JSON.stringify(nicks))
    var msg = {
      version: 1,
      type: 'names',
      data: {
        channel: channel,
        nicks: nicks
      }
    }
    zen.redis.publish('in', JSON.stringify(msg))
  })

  irc.addListener('error', function(message) {
    logger.info(message)
  })
}