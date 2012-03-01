var fs = require('fs');
var redis_lib = require('redis');
var pub = redis_lib.createClient();


function send_privmsg(to, message) {
    if (typeof(to) == "string") {
        to = [to]
    }
    to.forEach(function(destination) {
        pub.publish('out', JSON.stringify({
            version: 1,
            type: 'privmsg',
            data: {
                to: destination,
                message: message
            }}))});

}

function send_admin_message(message) {
    var config = load_config('../bot.json');
    send_privmsg(config.servers[0].admin_spew_channels, message);

}

function register_commands(service, commands) {
    send_admin_message(service + " online!")
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
