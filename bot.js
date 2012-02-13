var redis_lib = require('redis');
var pub = redis_lib.createClient();
var sub = redis_lib.createClient();
var irc = require('irc');
var api = require('./services/lib/api');
var config = api.load_config('bot.json');

function server_options(config) {
    return {
	userName: config.servers[0].userName,
	realName: config.servers[0].realName,
	port: config.servers[0].port,
	autoRejoin: config.servers[0].autoRejoin,
	autoConnect: config.servers[0].autoConnect,
	channels: config.servers[0].channels,
	secure: config.servers[0].secure,
	selfSigned: config.servers[0].selfSigned,
	debug: config.options.debug,
	floodProtection: config.options.floodProtection,
	showErrors: config.options.debug,
	stripColors: config.options.stripColors,
    }
}

var bot = new irc.Client(config.servers[0].hostname, config.servers[0].nick, server_options(config));

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
    output_handlers[msg.version](msg)
});

function output_version_1(message) {
    console.log('output_version_1');
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
