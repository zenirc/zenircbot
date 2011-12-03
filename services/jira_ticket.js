var redis_lib = require('redis');
var sub = redis_lib.createClient();
var api = require('./lib/api');
var ticket = /(?:\s|^)([a-zA-Z][a-zA-Z]-\d+)/;
var config = require('./jira_ticket_config')

sub.subscribe('in');
sub.on('message', function(channel, message){
    msg = JSON.parse(message)
    if (msg.version == 1 && msg.type == 'privmsg') {
	if (msg.data.channel == config.channel && ticket.test(msg.data.message)) {
	    result = ticket.exec(msg.data.message)
	    console.log(result[1])
	    api.send_message(msg.data.channel,
			     config.jira_url + 'browse/' + result[1]);
	}
    }
});
