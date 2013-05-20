var api = require('zenircbot-api')
var zen = new api.ZenIRCBot()

zen.register_commands('semantics.js', [])

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
    }))
}

var filtered = zen.filter({version: 1, type: 'privmsg'})
filtered.on('data', function(msg) {
    zen.redis.get('zenircbot:nick', function(err, nick) {
        if (msg.data.message.indexOf(nick + ': ') === 0) {
            directed_message(msg.data.message,
                             msg.data.message.substr(nick.length+2),
                             msg.data.sender,
                             msg.data.channel)
        } else if (msg.data.message.indexOf('!') === 0) {
            directed_message(msg.data.message,
                             msg.data.message.substr(1),
                             msg.data.sender,
                             msg.data.channel)
        } else if (msg.data.channel === msg.data.sender) {
            directed_message(msg.data.message,
                             msg.data.message,
                             msg.data.sender,
                             msg.data.channel)

        }
    })
})