var exec = require('child_process').exec;
var api = require('zenircbot-api')
var admin_config = api.load_config('./admin.json');
var bot_config = api.load_config('../bot.json');
var zen = new api.ZenIRCBot(bot_config.redis.host,
                            bot_config.redis.port,
                            bot_config.redis.db);
var sub = zen.get_redis_client()
var service_regex = /(\w+) (.*)/;
var forever = require('forever');
var services = {};

function puts(error, stdout, stderr) { console.log(stdout); }

language_map = {'js': 'node',
                'py': 'python',
                'rb': 'ruby'}

admin_config.services.forEach(start_service)

zen.register_commands("admin.js", [
    {name: "start <service>",
     description: "This will start the service mentioned."},
    {name: "restart <service>",
     description: "This will restart the service mentioned if it was started via admin.js."},
    {name: "stop <service>",
     description: "This will stop the service mentioned if it was started via admin.js."},
    {name: "pull",
     description: "This will pull down the code for the zenircbot."}]);

sub.subscribe('in');
sub.on('message', function(channel, message){
    var msg = JSON.parse(message);
    if (msg.version == 1 && msg.type == 'directed_privmsg') {
        if (bot_config.servers[0].admin_nicks.indexOf(msg.data.sender) != -1) {
            if (service_regex.test(msg.data.message)) {
                var result = service_regex.exec(msg.data.message);
                if (result[1] == 'start') {
                    start_service(result[2]);
                } else if (result[1] == 'restart') {
                    restart_service(result[2]);
                } else if (result[1] == 'stop') {
                    stop_service(result[2]);
                }
            } else if (msg.data.message == 'pull') {
                git_pull();
            }
        }
    }
});

function start_service(service) {
    if (services[service]) {
        if (services[service].running) {
            zen.send_admin_message(service + ' is already running');
        } else {
            zen.send_admin_message('starting ' + service);
            services[service].start();
        }
    } else {
        zen.send_admin_message('starting ' + service);
        child = forever.start([language_map[service.split('.')[1]], service], {
            max: 10000,
            silent: false
        });
        forever.startServer(child);
        services[service] = child;
        forever.cli.list();
    }
}

function restart_service(service) {
    if (!services[service] || !services[service].running) {
        zen.send_admin_message(service + ' isn\'t running');
    } else {
        zen.send_admin_message('restarting ' + service);
        services[service].restart();
    }
}

function stop_service(service) {
    if (!services[service] || !services[service].running) {
        zen.send_admin_message(service + ' isn\'t running');
    } else {
        zen.send_admin_message('stopping ' + service);
        services[service].stop();
    }
}

function git_pull() {
    zen.send_admin_message('pulling down new code');
    exec("git pull", puts);
}
