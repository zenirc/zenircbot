var redis_lib = require('redis');
var pub = redis_lib.createClient();
var sub = redis_lib.createClient();
var ticket = /^!email$/;

sub.subscribe('in');
sub.on('message', function(channel, message){
    msg = JSON.parse(message)
    if (msg.version == 1 && msg.type == 'privmsg') {
	if (ticket.test(msg.data.message)) {
	    reply = {
		channel: msg.data.channel,
		message: msg.data.sender + ': http://is.gd/ehurul',
	    }
	    pub.publish('out', JSON.stringify(reply));
	}
    }
});
