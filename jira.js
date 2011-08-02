var redis_lib = require('redis');
var pub = redis_lib.createClient();
var sub = redis_lib.createClient();
var ticket = /(?:\s|^)([a-zA-Z][a-zA-Z]-\d+)/;
var config = require('./jira_config')

sub.subscribe(config.channel + '_in');
sub.on('message', function(channel, message){
    if (ticket.test(message)) {
	result = ticket.exec(message)
	console.log(result[1])
	pub.publish(config.channel + '_out', config.jira_url + 'browse/' + result[1]);
    }
});
