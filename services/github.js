var api = require('zenircbot-api');
var bot_config = api.load_config('../bot.json');
var zen = new api.ZenIRCBot(bot_config.redis.host,
                            bot_config.redis.port,
                            bot_config.redis.db);
var sub = zen.get_redis_client();
var color = require('./lib/colors');
var github_config = api.load_config('./github.json');


zen.register_commands("github.js", []);

sub.subscribe('web_in');
sub.on('message', function(channel, message){
    message = JSON.parse(message);
    if (message.app != 'github') {
        return null;
    }
    var github_json = JSON.parse(message.body.payload);

    var branch = github_json.ref.substr(11);
    var repo = github_json.repository.name;
    var name_str = '';
    for (var i=0; i< github_json.commits.length; i++) {
        var commit = github_json.commits[i];
        if (commit.author.username) {
            name_str = ' - ' + commit.author.username + ' (' + commit.author.name + ')';
        } else if (commit.author.name) {
            name_str = ' - ' + commit.author.name;
        } else {
            name_str = '';
        }
        message = repo + ': ' + commit.id.substr(0,7) + ' *' + color.green + branch + color.reset +'* ' + commit.message + name_str;
        zen.send_privmsg(github_config.channels, message);
        console.log(branch + ': ' + commit.author.username);
    }
});
