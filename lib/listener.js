module.exports = function addListeners(irc, zen, bot, serverConfig) {

  irc.addListener('connect', function() {
    if(!bot.pingLoop[serverConfig.hostname]) {
      console.log("Connected, starting PING request loop")
      bot.startPing(serverConfig.ping, serverConfig.hostname)
    }
  })

  irc.addListener('raw', function(message) {
    if(message.command === "PONG") {
      bot.pings[serverConfig.hostname] = 0
      console.log("Received PONG")
    }
  })

  irc.addListener('ctcp', function(nick, to, text, type) {
    // this assumes all CTCPs are ACTION, need to check `type`
    console.log(type + ': ' + nick + ' said ' + text + ' to ' + to)
    if (to === irc.nick) {
      to = nick
    }
    var msg = {
      version: 1,
      type: 'privmsg_action',
      data: {
        sender: nick,
        channel: to,
        message: text.replace(/^ACTION /, '')
      }
    }
    zen.redis.publish('in', JSON.stringify(msg))
  })

  irc.addListener('message', function(nick, to, text) {
    console.log(nick + ' said ' + text + ' to ' + to)
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
    zen.redis.set('zenircbot:nick', newNick)
  })

  irc.addListener('join', function(channel, nick) {
    console.log(nick + ' joined ' + channel)
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
    console.log(nick + ' left ' + channel + ' because ' + reason)
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
    console.log(nick + ' quit')
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
    console.log(nick + ' changed the topic in ' +
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
    console.log('Names: '+channel + " " + JSON.stringify(nicks))
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
    console.log(message)
  })
}