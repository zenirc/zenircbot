var redis_lib = require('redis');
var sub = redis_lib.createClient();
var sys = require('sys');
var exec = require('child_process').exec;
var api = require('./lib/api');
var bot_config = api.load_config('../bot.json');
var service_regex = new RegExp(bot_config.servers[0].nick + ': restart (.*)');


function puts(error, stdout, stderr) { sys.puts(stdout); }

api.register_commands("admin.js", [{name: "restart",
                                    description: "This will restart the bot if it is running in tmux."},
                                   {name: "restart <service>",
                                    description: "This will restart the service mentioned if it is JS and running in tmux."},
                                   {name: "git pull",
                                    description: "This will pull down the code for the zenircbot."}]);

sub.subscribe('in');
sub.on('message', function(channel, message){
    var msg = JSON.parse(message);
    if (msg.version == 1 && msg.type == 'privmsg') {
        if (bot_config.servers[0].admin_nicks.indexOf(msg.data.sender) != -1) {
            if (msg.data.message == bot_config.servers[0].nick + ': restart') {
                restart();
            } else if (service_regex.test(msg.data.message)) {
                result = service_regex.exec(msg.data.message);
                restart_service(result[1]);
            } else if (msg.data.message == bot_config.servers[0].nick + ': pull') {
                git_pull();
            }
        }
    }
});

function restart() {
    api.send_admin_message('brb!');
    exec("fab zenbot restart", puts);
}

function restart_service(service) {
    api.send_admin_message('restarting ' + service);
    exec("fab zenbot service:" + service, puts);
}

function git_pull() {
    api.send_admin_message('pulling down new code');
    exec("git pull", puts);
}
