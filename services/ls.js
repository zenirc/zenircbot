var redis_lib = require('redis');
var pub = redis_lib.createClient();
var sub = redis_lib.createClient();
var ls = /^ls$/;
var exec = require("child_process").exec;

sub.subscribe('in');
sub.on('message', function(channel, message){
    msg = JSON.parse(message)
    if (msg.version == 1 && msg.type == 'privmsg') {
	if (ls.test(msg.data.message)) {
	    reply = {
		channel: msg.data.channel,
		message: msg.data.sender + ': http://is.gd/afolif',
	    }
	    pub.publish('out', JSON.stringify(reply));
	}
    }
});
