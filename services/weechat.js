var redis_lib = require('redis');
var api = require('./lib/api');
var sub = redis_lib.createClient();
var weechat = /irssi/i;

sub.subscribe('in');
sub.on('message', function(channel, message){
    msg = JSON.parse(message)
    if (msg.version == 1 && msg.type == 'privmsg') {
	if (weechat.test(msg.data.message)) {
	    result = weechat.exec(msg.data.message)
	    console.log(result[1])
	    api.send_privmsg(msg.data.channel,
			     msg.data.sender + ': Use weechat.');
	}
    }
});
