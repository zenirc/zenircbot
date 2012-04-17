var api = require('zenircbot-api');
var bot_config = api.load_config('../bot.json');
var zen = new api.ZenIRCBot(bot_config.redis.host,
                            bot_config.redis.port,
                            bot_config.redis.db);
var sub = zen.get_redis_client();
var release_config = api.load_config('./release.json');


zen.register_commands('release.js', []);

sub.subscribe('web_in');
sub.on('message', function(channel,message){
    message = JSON.parse(message);
    if (message.app != 'release') {
        return null;
    }
    var release_json = JSON.parse(message.body.payload);
    zen.send_privmsg(release_config.channels,
                     'release of ' + release_json.branch +
                     ' ' + release_json.status +
                     ' on ' + release_json.hostname);

});
