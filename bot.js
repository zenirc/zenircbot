var irc = require('irc');
var api = require('zenircbot-api')
var opts = require('nomnom')
    .option('config', {
        'abbr': 'c',
        'default': 'bot.json',
        'help': 'config file to use'
    }).parse()

zenircbot = {
    setup: function() {
        var config = zenircbot.config = api.load_config(opts.config);
        var zen = new api.ZenIRCBot(config.redis.host, config.redis.port,
                                    config.redis.db)


        zenircbot.unsetRedisKeys(zen);
        var cfg = zenircbot.server_config_for(0);
        console.log('irc server: '+cfg.hostname+' nick: '+cfg.nick);

        zenircbot.irc = new irc.Client(cfg.hostname, cfg.nick, cfg);
        var bot = zenircbot.irc;

        var pingLoopActive = false;

        bot.addListener('connect', function() {
            zenircbot.pub.set('zenircbot:nick', bot.nick);
            zenircbot.pub.set('zenircbot:admin_spew_channels',
                              cfg.admin_spew_channels);
            if(pingLoopActive == false) {
                console.log("Connected, starting PING request loop");
                newPingRequest();
            }
        });

        bot.addListener('ctcp', function(nick, to, text, type) {
            console.log('action: ' + nick + ' said ' + text + ' to ' + to);
            if (to == bot.nick) {
                to = nick;
            }
            var msg = {
                version: 1,
                type: 'privmsg_action',
                data: {
                    sender: nick,
                    channel: to,
                    message: text.replace(/^ACTION /, '')
                }
            };
            zen.redis.publish('in', JSON.stringify(msg));
        });

        bot.addListener('message', function(nick, to, text, message) {
            console.log(nick + ' said ' + text + ' to ' + to);
            if (to == bot.nick) {
                to = nick;
            }
            var msg = {
                version: 1,
                type: 'privmsg',
                data: {
                    sender: nick,
                    channel: to,
                    message: text
                }
            };
            zen.redis.publish('in', JSON.stringify(msg));
        });

        bot.addListener('nick', function(oldNick, newNick) {
            zen.redis.get('zenircbot:nick', function(err, nick) {
                if (nick == oldNick) {
                    zen.redis.set('zenircbot:nick', newNick);
                }
            });
        });

        bot.addListener('join', function(channel, nick, message) {
            console.log(nick + ' joined ' + channel);
            var msg = {
                version: 1,
                type: 'join',
                data: {
                    sender: nick,
                    channel: channel
                }
            };
            zen.redis.publish('in', JSON.stringify(msg));
        });

        bot.addListener('part', function(channel, nick, reason, message) {
            console.log(nick + ' left ' + channel + ' because ' + reason);
            var msg = {
                version: 1,
                type: 'part',
                data: {
                    sender: nick,
                    channel: channel
                }
            };
            zen.redis.publish('in', JSON.stringify(msg));
        });

        bot.addListener('quit', function(nick, reason, channels, message) {
            console.log(nick + ' quit');
            var msg = {
                version: 1,
                type: 'quit',
                data: {
                    sender: nick
                }
            };
            zen.redis.publish('in', JSON.stringify(msg));
        });

        bot.addListener('topic', function(channel, topic, nick, message) {
            console.log(nick + ' changed the topic in ' + channel + ' to "' + topic + '"');
            var msg = {
                version: 1,
                type: 'topic',
                data: {
                    sender: nick,
                    channel: channel,
                    topic: topic
                }
            };
            zen.redis.publish('in', JSON.stringify(msg));
        });

        bot.addListener('names', function(channel, nicks) {
            console.log('Names: '+channel + " " + JSON.stringify(nicks));
            var msg = {
                version: 1,
                type: 'names',
                data: {
                    channel: channel,
                    nicks: nicks
                }
            };
            zen.redis.publish('in', JSON.stringify(msg));
        });

        bot.addListener('error', function(message) {
            console.log(message);
        });

        var output_handlers = {
            1: zenircbot.output_version_1
        };

        sub = zen.get_redis_client(zenircbot.config.redis)
        sub.subscribe('out');
        sub.on('message', function(channel, message) {
            var msg = JSON.parse(message);
            output_handlers[msg.version](bot, msg);
        });

        // Set up "ping" timer

        if(true) {
            var pingRequestPending = false;

            function newPingRequest() {
                pingLoopActive =  true;
                console.log("Sending PING");
                bot.send("PING "+zenircbot.config.servers[0].hostname);
                pingRequestPending = true;
                // Set a timeout waiting for the PONG response
                setTimeout(function(){
                    if(pingRequestPending) {
                        // Timer ran before a pong was received. Assume we're disconnected and re-connect.
                        console.log("Didn't receive PONG in time, reconnecting...");
                        pingRequestPending = false;
                        pingLoopActive =  false;
                        bot.disconnect(function(){
                            setTimeout(function(){
                                bot.connect();
                            }, 3000);                            
                        });
                    } else {
                        console.log("Ping check succeeded. Checking again.");
                        newPingRequest();
                    }
                }, 5000);
            }

            bot.addListener('raw', function(message) {
                if(message.command == "PONG") {
                    pingRequestPending = false;
                    console.log("Received PONG");
                }
            });

        }

    },
    unsetRedisKeys: function(zen){
        zen.redis.del('zenircbot:nick');
        zen.redis.del('zenircbot:admin_spew_channels');
    },
    server_config_for: function(idx) {
        var cfg = zenircbot.config.servers[idx];
        /* server-generic options */
        cfg.debug = zenircbot.config.options.debug;
        cfg.floodProtection = zenircbot.config.options.floodProtection;
        cfg.showErrors = zenircbot.config.options.debug;
        cfg.stripColors = zenircbot.config.options.stripColors;
        return cfg;
    },
    output_version_1: function(bot, message) {
        switch (message.type) {
        case 'privmsg':
            console.log('  privmsg: ' + JSON.stringify(message));
            bot.say(message.data.to, message.data.message);
            break;
        case 'privmsg_action':
            console.log('  privmsg_action');
            bot.say(message.data.to, '\u0001ACTION ' + message.data.message +
                    '\u0001');
            break;
        case 'raw':
            console.log('  raw');
            bot.send(message.command);
            break;
        }
    }
}

zenircbot.setup();
