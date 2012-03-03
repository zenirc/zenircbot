var api = require('./lib/api');
var sub = api.get_redis_client();
var ticket = /(?:\s|^)([a-zA-Z][a-zA-Z]-\d+)/;
var config = api.load_config('./jira.json');


api.register_commands('jira_ticket.js', []);

sub.subscribe('in');
sub.on('message', function(channel, message){
    var msg = JSON.parse(message);
    if (msg.version == 1 && msg.type == 'privmsg') {
        if (config.channels.indexOf(msg.data.channel) != -1) {
            if (ticket.test(msg.data.message)) {
                var result = ticket.exec(msg.data.message);
                console.log(result[1]);
                api.send_privmsg(config.channels,
                                 config.jira_url + 'browse/' + result[1]);
            }
        }
    }
});
