var redis_lib = require('redis');
var sub = redis_lib.createClient();
var pub = redis_lib.createClient();
var sys = require('sys')
var exec = require('child_process').exec;
var bot_config = require('../config');
var config = require('./admin_config');
var service = new RegExp(bot_config.user.nick + ': service (.*)');

function puts(error, stdout, stderr) { sys.puts(stdout) }

pub.publish('out', JSON.stringify({
    channel: config.channel,
    message: 'admin online',
}));

sub.subscribe('in');
sub.on('message', function(channel, message){
    msg = JSON.parse(message)
    if (msg.sender == bot_config.admin) { 
	if (msg.message == 'ZenWraithBot: restart') {
	    pub.publish('out', JSON.stringify({
		channel: config.channel,
		message: 'brb!',
	    }));
	    exec("fab zenbot restart", puts);
	} else if (service.test(msg.message)) {
	    result = service.exec(msg.message);
	    pub.publish('out', JSON.stringify({
		channel: config.channel,
		message: 'restarting ' + result[1],
	    }));
	    exec("fab zenbot service:" + result[1], puts);
	} else if (msg.message == 'ZenWraithBot: pull') {
	    pub.publish('out', JSON.stringify({
		channel: config.channel,
		message: 'pulling down new code',
	    }));
	    exec("git pull", puts);
	}
    } else {
	console.log(msg.message);
    }
	
});
