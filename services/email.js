var redis_lib = require('redis');
var pub = redis_lib.createClient();
var sub = redis_lib.createClient();
var ticket = /^!email$/;

sub.subscribe('in');
sub.on('message', function(channel, message){
    msg = JSON.parse(message)
    if (ticket.test(msg.message)) {
	reply = {
	    channel: msg.channel,
	    message: msg.sender + ': http://is.gd/ehurul',
	}
	pub.publish('out', JSON.stringify(reply));
    }
});
