var redis_lib = require('redis');
var sub = redis_lib.createClient();
var api = require('./lib/api')
var color = require('./lib/colors');
var github_config = require('./github_config');

api.send_privmsg(github_config.channel,
		 'github post commit hook broadcaster online');

sub.subscribe('web_in')
sub.on('message', function(channel,message){
    message = JSON.parse(message);
    if (message.app != 'github') {
	return
    }
    github_json = JSON.parse(message.body.payload);
    
    branch = github_json.ref.substr(11);
    repo = github_json.repository.name;
    name_str = '';
    for (var i=0; i< github_json.commits.length; i++) {
	commit = github_json.commits[i];
	if (commit.author.username) {
	    name_str = ' - ' + commit.author.username + ' (' + commit.author.name + ')';
	} else if (commit.author.name) {
	    name_str = ' - ' + commit.author.name;
	} else {
	    name_str = '';
	}
	message = repo + ': ' + commit.id.substr(0,7) + ' *' + color.green + branch + color.reset +'* ' + commit.message + name_str;
	api.send_privmsg(github_config.channel, message);
	console.log(branch + ': ' + commit.author.username);
    }
});
