var redis_lib = require('redis');
var pub = redis_lib.createClient();

module.exports = {
    send_privmsg: function(to, message) {
	return pub.publish('out', JSON.stringify({
	    version: 1,
	    type: 'privmsg',
	    data: {
		to: to,
		message: message
	    },
	}));
    }
}