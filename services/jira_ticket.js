var redis_lib = require('redis');
var sub = redis_lib.createClient();
var api = require('./lib/api');
var ticket = /(?:\s|^)([a-zA-Z][a-zA-Z]-\d+)/;
var config = api.load_config('./jira.json');


api.register_commands('jira_ticket.js', []);

sub.subscribe('in');
sub.on('message', function(channel, message){
    var msg = JSON.parse(message);
    if (msg.version == 1 && msg.type == 'privmsg') {
        if (msg.data.channel == config.channel && ticket.test(msg.data.message)) {
            var result = ticket.exec(msg.data.message);
            console.log(result[1]);
            api.send_privmsg(msg.data.channel,
                             config.jira_url + 'browse/' + result[1]);
        }
    }
});
