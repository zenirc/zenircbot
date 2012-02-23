var redis_lib = require('redis');
var pub = redis_lib.createClient();
var sub = redis_lib.createClient();
var irc = require('irc');
var api = require('./services/lib/api');
var config = api.load_config('bot.json');

function server_config_for(idx) {
    var cfg = config.servers[idx]
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
	var cfg = server_config_for(0)
	console.log('irc server: '+cfg.hostname+' nick: '+cfg.nick)
	var bot = new irc.Client(cfg.hostname, cfg.nick, cfg);

	bot.addListener('message', function(nick, to, text, message) {
	    console.log(nick + ' said ' + text + ' to ' + to);
	    msg = {
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

	var output_handlers = {
	    1: output_version_1,
	};

	sub.subscribe('out')
	sub.on('message', function(channel, message) {
	    msg = JSON.parse(message);
	    output_handlers[msg.version](bot, msg)
	});
}

setup();