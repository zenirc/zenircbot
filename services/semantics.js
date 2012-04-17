var api = require('zenircbot-api');
var bot_config = api.load_config('../bot.json');
var zen = new api.ZenIRCBot(bot_config.redis.host,
                            bot_config.redis.port,
                            bot_config.redis.db);
var sub = zen.get_redis_client();

zen.register_commands('semantics.js', []);

sub.subscribe('in');
sub.on('message', function(channel, message) {
    var msg = JSON.parse(message);
    if (msg.version == 1 && msg.type == 'privmsg') {
        zen.redis.get('zenircbot:nick', function(err, nick) {
            if (msg.data.message.indexOf(nick + ': ') == 0) {
                directed_message(msg.data.message,
                                 msg.data.message.substr(nick.length+2),
                                 msg.data.sender,
                                 msg.data.channel);
            } else if (msg.data.message.indexOf('!') == 0) {
                directed_message(msg.data.message,
                                 msg.data.message.substr(1),
                                 msg.data.sender,
                                 msg.data.channel);
            } else if (msg.data.channel == msg.data.sender) {
                directed_message(msg.data.message,
                                 msg.data.message,
                                 msg.data.sender,
                                 msg.data.channel);

            }
        });
    }
});

function directed_message(raw_message, message, sender, channel) {
    zen.redis.publish('in', JSON.stringify({
        version: 1,
        type: 'directed_privmsg',
        data: {
            channel: channel,
            raw_message: raw_message,
            message: message,
            sender: sender
        }
    }));
}
