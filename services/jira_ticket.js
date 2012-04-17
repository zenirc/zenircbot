var api = require('zenircbot-api');
var bot_config = api.load_config('../bot.json');
var zen = new api.ZenIRCBot(bot_config.redis.host,
                            bot_config.redis.port,
                            bot_config.redis.db);
var sub = zen.get_redis_client();
var ticket = /(?:\s|^)([a-zA-Z][a-zA-Z]-\d+)/g;
var config = api.load_config('./jira.json');


zen.register_commands('jira_ticket.js', []);

sub.subscribe('in');
sub.on('message', function(channel, message){
    var msg = JSON.parse(message);
    if (msg.version == 1 && msg.type == 'privmsg') {
        if (config.channels.indexOf(msg.data.channel) != -1) {
            var result = ticket.exec(msg.data.message);
            while (result) {
                console.log(result[1]);
                zen.send_privmsg(config.channels,
                                 config.jira_url + 'browse/' + result[1]);
                lastIndex = ticket.lastIndex;
                result = ticket.exec(msg.data.message);
            }
        }
    }
});
