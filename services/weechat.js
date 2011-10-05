var redis_lib = require('redis');
var pub = redis_lib.createClient();
var sub = redis_lib.createClient();
var ticket = /irssi/i;

sub.subscribe('in');
sub.on('message', function(channel, message){
    msg = JSON.parse(message)
    if (ticket.test(msg.message)) {
	result = ticket.exec(msg.message)
	console.log(result[1])
	reply = {
	    channel: msg.channel,
	    message: msg.sender + ': Use weechat.',
	}
	pub.publish('out', JSON.stringify(reply));
    }
});
