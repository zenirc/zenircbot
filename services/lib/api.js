var fs = require('fs');
var redis_lib = require('redis');
var pub = null;

function send_privmsg(to, message) {
    if (!pub) {
        pub = get_redis_client();
    }
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
            }
        }))
    });
}

function send_admin_message(message) {
    var config = load_config('../bot.json');
    send_privmsg(config.servers[0].admin_spew_channels, message);
}

function register_commands(service, commands) {
    send_admin_message(service + " online!")
    sub = get_redis_client();
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

function get_redis_client(redis_config) {
    if (!redis_config) {
        redis_config = load_config('../bot.json').redis;
    }
    return redis_lib.createClient(redis_config.port,
                                  redis_config.host, {
                                      selected_db: redis_config.db
                                  });
}

function set_topic(channel, topic) {
    return get_redis_client().publish('out', JSON.stringify({
        version: 1,
        type: 'raw',
        data: {
            command: 'TOPIC ' + channel + ' :' + topic,
        },
    }));
}

module.exports = {
    send_privmsg: send_privmsg,
    send_admin_message: send_admin_message,
    register_commands: register_commands,
    load_config: load_config,
    get_redis_client: get_redis_client,
    set_topic: set_topic
}
