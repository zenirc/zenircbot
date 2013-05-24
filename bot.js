var irc = require('irc')
var api = require('zenircbot-api')
var opts = require('nomnom').option('config', {
                                      'abbr': 'c',
                                      'default': 'bot.json',
                                      'help': 'config file to use'
                                    }).parse()
var listener = require('./lib/listener')

var zenircbot = {
  setup: function() {
    var config = zenircbot.config = api.load_config(opts.config)
    var zen = new api.ZenIRCBot(config.redis)

    zenircbot.unsetRedisKeys(zen)
    var serverConfig = zenircbot.server_config_for(0)
    console.log('irc server: ' + serverConfig.hostname +
                ' nick: '+ serverConfig.nick)

    zen.redis.set('zenircbot:nick', serverConfig.nick)
    zen.redis.set('zenircbot:admin_spew_channels',
                  serverConfig.admin_spew_channels)

    zenircbot.irc = new irc.Client(serverConfig.hostname, serverConfig.nick,
                                   serverConfig)
    zenircbot.pingLoop = {}
    zenircbot.pings = {}

    listener(zenircbot.irc, zen, zenircbot, serverConfig)

    var output_handlers = {
      1: zenircbot.output_version_1
    }

    var sub = zen.get_redis_client(zenircbot.config.redis)
    sub.subscribe('out')
    sub.on('message', function(channel, message) {
      var msg = JSON.parse(message)
      output_handlers[msg.version](zenircbot.irc, msg)
    })
  },

  startPing: function(config, server) {
    zenircbot.pings[server] = 0

    zenircbot.pingLoop[server] = setInterval(function() {
      if (zenircbot.pings[server] === config.maxFailures) {
        console.log("Didn't receive PONG in time, reconnecting...")
        clearInterval(zenircbot.pingLoop[server])
        zenircbot.pings[server] = 0
        zenircbot.pingLoop[server] = null
        zenircbot.irc.disconnect(function(){
          setTimeout(function(){
            zenircbot.irc.connect()
          }, 2000)
        })
      } else {
        zenircbot.pings[server] += 1
        console.log("Sending PING")
        zenircbot.irc.send("PING "+server)
      }
    }, config.frequency)
  },

  unsetRedisKeys: function(zen){
    zen.redis.del('zenircbot:nick')
    zen.redis.del('zenircbot:admin_spew_channels')
  },

  server_config_for: function(idx) {
    var cfg = zenircbot.config.servers[idx]
    /* server-generic options */
    cfg.debug = zenircbot.config.options.debug
    cfg.floodProtection = zenircbot.config.options.floodProtection
    cfg.showErrors = zenircbot.config.options.debug
    cfg.stripColors = zenircbot.config.options.stripColors
    return cfg
  },

  output_version_1: function(bot, message) {
    switch (message.type) {
      case 'privmsg':
        console.log('  privmsg: ' + JSON.stringify(message))
        bot.say(message.data.to, message.data.message)
        break

      case 'privmsg_action':
        console.log('  privmsg_action')
        bot.say(message.data.to,
                '\u0001ACTION ' + message.data.message + '\u0001')
        break

      case 'raw':
        console.log('  raw')
        bot.send(message.command)
        break
    }
  }
}

zenircbot.setup()
