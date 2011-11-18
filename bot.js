var config = require('./config');
var redis_lib = require('redis');
var pub = redis_lib.createClient();
var sub = redis_lib.createClient();
var irc = require('irc');

var bot = new irc.Client(config.server, config.nick, config.options);

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

sub.subscribe('out')
sub.on('message', function(channel, message) {
    message = JSON.parse(message);
    console.log('saying ' + message.message + ' to ' + message.channel);
    bot.say(message.channel, message.message);
});
