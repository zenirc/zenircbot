var redis_lib = require('redis');
var pub = redis_lib.createClient();
var sub = redis_lib.createClient();
var ticket = /(?:\s|^)([a-zA-Z][a-zA-Z]-\d+)/;
var config = require('./jira_ticket_config')

sub.subscribe('in');
sub.on('message', function(channel, message){
    msg = JSON.parse(message)
    if (msg.version == 1 && msg.type == 'privmsg') {
	if (msg.data.channel == config.channel && ticket.test(msg.data.message)) {
	    result = ticket.exec(msg.data.message)
	    console.log(result[1])
	    reply = {
		channel: msg.data.channel,
		message: config.jira_url + 'browse/' + result[1],
	    }
	    pub.publish('out', JSON.stringify(reply));
	}
    }
});
