var api = require('./lib/api');
var sub = api.get_redis_client();
var exec = require("child_process").exec;


api.register_commands("troll.js", [{name: "ls",
                                    description: "trolls the user for saying ls"},
                                   {name: "irssi",
                                   description: "If someone mentions irssi, it suggests weechat instead."}]);

sub.subscribe('in');
sub.on('message', function(channel, message){
    var msg = JSON.parse(message);
    if (msg.version == 1 && msg.type == 'privmsg') {
        if (/^ls$/.test(msg.data.message)) {
            api.send_privmsg(msg.data.channel,
                             msg.data.sender + ': http://is.gd/afolif');
        } else if (/irssi/i.test(msg.data.message)) {
            api.send_privmsg(msg.data.channel,
                             msg.data.sender + ': Use weechat.');
        }
    }
});
