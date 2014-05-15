var irc = require('irc');
var api = require('./services/lib/api');
var opts = require('nomnom')
    .option('config', {
        'abbr': 'c',
        'default': 'bot.json',
        'help': 'config file to use'
    }).parse()

zenircbot = {
    setup: function() {
        zenircbot.config = api.load_config(opts.config);
        zenircbot.pub = api.get_redis_client(zenircbot.config.redis);
        zenircbot.sub = api.get_redis_client(zenircbot.config.redis);

        zenircbot.unsetRedisKeys();
        var cfg = zenircbot.server_config_for(0);
        console.log('irc server: '+cfg.hostname+' nick: '+cfg.nick);
        zenircbot.irc = new irc.Client(cfg.hostname, cfg.nick, cfg);
        var bot = zenircbot.irc

        bot.addListener('connect', function() {
            zenircbot.pub.set('zenircbot:nick', bot.nick);
            zenircbot.pub.set('zenircbot:admin_spew_channels',
                              cfg.admin_spew_channels)
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
            zenircbot.pub.publish('in', JSON.stringify(msg));
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
            zenircbot.pub.publish('in', JSON.stringify(msg));
        });

        bot.addListener('nick', function(oldNick, newNick) {
            zenircbot.pub.get('zenircbot:nick', function(err, nick) {
                if (nick == oldNick) {
                    zenircbot.pub.set('zenircbot:nick', newNick);
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
            zenircbot.pub.publish('in', JSON.stringify(msg));
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
            zenircbot.pub.publish('in', JSON.stringify(msg));
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
            zenircbot.pub.publish('in', JSON.stringify(msg));
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
            zenircbot.pub.publish('in', JSON.stringify(msg));
        });

        bot.addListener('names', function(channel, nicks) {
            console.log('Names: '+channel);
            console.log(nicks);
            var msg = {
                version: 1,
                type: 'names',
                data: {
                    channel: channel,
                    nicks: nicks
                }
            };
            zenircbot.pub.publish('in', JSON.stringify(msg));
        });

        bot.addListener('error', function(message) {
            console.log(message);
        });

        var output_handlers = {
            1: zenircbot.output_version_1
        };

        zenircbot.sub.subscribe('out');
        zenircbot.sub.on('message', function(channel, message) {
            var msg = JSON.parse(message);
            output_handlers[msg.version](bot, msg);
        });
    },
    unsetRedisKeys: function(){
        zenircbot.pub.del('zenircbot:nick');
        zenircbot.pub.del('zenircbot:admin_spew_channels');
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
            console.log('  privmsg');
            bot.say(message.data.to, message.data.message);
            break;
        case 'privmsg_action':
            console.log('  privmsg_action');
            bot.say(message.data.to, '\u0001ACTION ' + message.data.message + '\u0001');
            break;
        case 'topic':
            console.log('  topic');
            bot.send('TOPIC', message.channel, message.topic);
            break;
        case 'raw':
            console.log('  raw');
            bot.send(message.command);
            break;
        }
    }
}

zenircbot.setup();
