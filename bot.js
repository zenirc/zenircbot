var irc = require('irc')
  , api = require('zenircbot-api')
  , logger = require('./lib/logger')(__filename)
  , listener = require('./lib/listener')
  , one = require('./lib/one')
  , opts = require('nomnom').option('config', {
                                      'abbr': 'c',
                                      'default': 'bot.json',
                                      'help': 'config file to use'
                                    }).parse()

var zenircbot = {
  setup: function() {
    var config = zenircbot.config = api.load_config(opts.config)
      , zen = new api.ZenIRCBot(config.redis)

    zenircbot.connected = false

    // propegate options to server for IRC lib
    for (var i in config.options) {
      config.server[i] = config.options[i]
    }

    logger.debug('irc server: ' + config.server.hostname +
                 ' nick: '+ config.server.nick)

    zen.redis.set('zenircbot:nick', config.server.nick)
    zen.redis.set('zenircbot:admin_spew_channels',
                  config.server.admin_spew_channels)

    zenircbot.irc = new irc.Client(config.server.hostname
                                  , config.server.nick
                                  , config.server)

    listener(zenircbot.irc, zen, zenircbot, config)

    var output_handlers = {
      1: one
    }

    var sub = zen.get_redis_client(zenircbot.config.redis)
    sub.subscribe('out')
    sub.on('message', function(channel, message) {
      var msg = JSON.parse(message)
      output_handlers[msg.version](zenircbot.irc, msg)
    })
  },

  startPing: function(ping_config, hostname) {
    zenircbot.pings = 0

    zenircbot.pingLoop = setInterval(function() {
      if (zenircbot.pings >= ping_config.maxFailures) {
        logger.warn('Did not receive PONG in time')
        clearInterval(zenircbot.pingLoop)
        zenircbot.pings = 0
        zenircbot.pingLoop = null
        zenircbot.irc.disconnect(function(){
          zenircbot.connected = false
          var reconnect = setInterval(function(){
            if (!zenircbot.connected) {
              logger.info('reconnecting...')
              zenircbot.irc.connect()
            } else {
              logger.info('clearing reconnect handler...')
              clearInterval(reconnect)
            }
          }, 2000)
        })
      } else {
        zenircbot.pings += 1
        logger.debug('Sending PING')
        zenircbot.irc.send('PING ' + hostname)
      }
    }, ping_config.frequency)
  }
}

zenircbot.setup()
