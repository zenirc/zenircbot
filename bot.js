var irc = require('irc');
var api = require('./services/lib/api');
var config = api.load_config('bot.json');
var pub = api.get_redis_client(config.redis);
var sub = api.get_redis_client(config.redis);

function server_config_for(idx) {
    var cfg = config.servers[idx];
    /* server-generic options */
    cfg.debug = config.options.debug;
    cfg.floodProtection = config.options.floodProtection;
    cfg.showErrors = config.options.debug;
    cfg.stripColors = config.options.stripColors;
    return cfg;
}

function output_version_1(bot, message) {
    switch (message.type) {
    case 'privmsg':
        console.log('  privmsg');
        bot.say(message.data.to, message.data.message);
        break;
    case 'raw':
        console.log('  raw');
        bot.send(message.command);
        break;
    }
}

function setup() {
    var cfg = server_config_for(0);
    console.log('irc server: '+cfg.hostname+' nick: '+cfg.nick);
    var bot = new irc.Client(cfg.hostname, cfg.nick, cfg);

    bot.addListener('message', function(nick, to, text, message) {
        console.log(nick + ' said ' + text + ' to ' + to);
        var msg = {
            version: 1,
            type: 'privmsg',
            data: {
                sender: nick,
                channel: to,
                message: text,
            },
        };
        pub.publish('in', JSON.stringify(msg));
    });

    bot.addListener('part', function(channel, nick, reason, message) {
        console.log(nick + ' left ' + channel + ' because ' + reason);
        var msg = {
            version: 1,
            type: 'part',
            data: {
                sender: nick,
                channel: channel,
            },
        };
        pub.publish('in', JSON.stringify(msg));
    });

    bot.addListener('quit', function(nick, reason, channels, message) {
        console.log(nick + ' quit');
        var msg = {
            version: 1,
            type: 'quit',
            data: {
                sender: nick,
            },
        };
        pub.publish('in', JSON.stringify(msg));
    });

    var output_handlers = {
        1: output_version_1,
    };

    sub.subscribe('out');
    sub.on('message', function(channel, message) {
        var msg = JSON.parse(message);
        output_handlers[msg.version](bot, msg);
    });
}

setup();
