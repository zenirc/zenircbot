var redis_lib = require('redis');
var sub = redis_lib.createClient();
var sys = require('sys');
var exec = require('child_process').exec;
var api = require('./lib/api');
var bot_config = api.load_config('../bot.json');
var config = api.load_config('admin.json');
var service_regex = new RegExp(bot_config.servers[0].nick + ': restart (.*)');

function puts(error, stdout, stderr) { sys.puts(stdout) }

api.send_privmsg(config.channel, 'admin online');

sub.subscribe('in');
sub.on('message', function(channel, message){
    msg = JSON.parse(message)
    if (msg.version == 1 && msg.type == 'privmsg') {
	if (config.owners.indexOf(msg.data.sender) != -1) {
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
    api.send_privmsg(config.channel, 'brb!');
    exec("fab zenbot restart", puts);
}

function restart_service(service) {
    api.send_privmsg(config.channel, 'restarting ' + service);
    exec("fab zenbot service:" + service, puts);
}

function git_pull() {
    api.send_privmsg(config.channel, 'pulling down new code');
    exec("git pull", puts);
}
