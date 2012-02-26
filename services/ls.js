var redis_lib = require('redis');
var sub = redis_lib.createClient();
var api = require('./lib/api');
var ls = /^ls$/;
var exec = require("child_process").exec;

api.register_commands("ls", [{name: "ls",
                              description: "trolls the user for saying ls"}]);

sub.subscribe('in');
sub.on('message', function(channel, message){
    msg = JSON.parse(message)
    if (msg.version == 1 && msg.type == 'privmsg') {
        if (ls.test(msg.data.message)) {
            api.send_privmsg(msg.data.channel,
                             msg.data.sender + ': http://is.gd/afolif');
        }
    }
});
