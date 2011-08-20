var redis_lib = require('redis');
var pub = redis_lib.createClient();
var sub = redis_lib.createClient();
var ticket = /(?:\s|^)([a-zA-Z][a-zA-Z]-\d+)/;
var config = require('./jira_ticket_config')

sub.subscribe('in');
sub.on('message', function(channel, message){
    msg = JSON.parse(message)
    if (msg.channel == config.channel && ticket.test(msg.message)) {
	result = ticket.exec(msg.message)
	console.log(result[1])
	reply = {
	    channel: msg.channel,
	    message: config.jira_url + 'browse/' + result[1],
	}
	pub.publish('out', JSON.stringify(reply));
    }
});
