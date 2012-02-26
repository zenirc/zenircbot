var redis_lib = require('redis');
var api = require('./lib/api');
var sub = redis_lib.createClient();
var weechat = /irssi/i;

api.register_commands("weechat", [{name: "irssi",
                                   description: "If someone mentions irssi, it suggests weechat instead."}])

sub.subscribe('in');
sub.on('message', function(channel, message){
    msg = JSON.parse(message)
    if (msg.version == 1 && msg.type == 'privmsg') {
        if (weechat.test(msg.data.message)) {
            result = weechat.exec(msg.data.message)
            console.log(result[1])
            api.send_privmsg(msg.data.channel,
                             msg.data.sender + ': Use weechat.');
        }
    }
});
