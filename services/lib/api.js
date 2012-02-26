var fs = require('fs');
var redis_lib = require('redis');
var pub = redis_lib.createClient();


function send_privmsg(to, message) {
    return pub.publish('out', JSON.stringify({
        version: 1,
        type: 'privmsg',
        data: {
            to: to,
            message: message
        },
    }));
}

function register_commands(service, commands) {
    sub = redis_lib.createClient();
    sub.subscribe('in');
    sub.on('message', function(channel, message){
        msg = JSON.parse(message)
        if (msg.version == 1 && msg.type == 'privmsg') {
            if (msg.data.message == "commands") {
                commands.forEach( function(command, index) {
                    send_privmsg(msg.data.sender,
                                 service + ": " +
                                 command.name + " - " +
                                 command.description);
                });
            }
        }
    });
    return sub
}

function load_config(name) {
    return JSON.parse(fs.readFileSync(name, 'utf8'));
}

module.exports = {
    send_privmsg: send_privmsg,
    register_commands: register_commands,
    load_config: load_config,
}
