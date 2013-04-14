var ZenIRCBot = require('zenircbot-api').ZenIRCBot
var zen = new ZenIRCBot()
var sub = zen.get_redis_client()
var sourceUrl = 'https://github.com/zenirc/zenircbot'

zen.register_commands(
    'troll.js',
    [
        {
            name: 'ls',
            description: 'Trolls the user for saying ls'
        }, {
            name: 'irssi',
            description: 'When someone mentions irssi, suggests weechat.'
        }
    ]
)

sub.subscribe('in')
sub.on('message', function(channel, message){
    var msg = JSON.parse(message)
    if (msg.version == 1) {
        if (msg.type == 'privmsg') {
            if (/^ls$/.test(msg.data.message)) {
                zen.send_privmsg(msg.data.channel,
                                 msg.data.sender + ': http://is.gd/afolif')
            }
        } else if (msg.type == 'directed_privmsg') {
            var who = ['whoareyou', 'who are you?', 'source']
            if (/^ping$/i.test(msg.data.message)) {
                zen.send_privmsg(msg.data.channel, msg.data.sender + ': pong!')
            } else if (who.indexOf(msg.data.message) != -1) {
                zen.redis.get('zenircbot:nick', function(err, nick) {
                    zen.send_privmsg(msg.data.channel,
                                     'I am ' + nick + ', an instance of ' +
                                     'ZenIRCBot. My source can be found ' +
                                     'here: ' + sourceUrl
                    )
                })
            }
        }
    }
})
