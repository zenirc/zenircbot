var express = require('express');
var app = express.createServer();
var redis = require('redis');
var client = redis.createClient();
var color = require('../lib/colors');
var github_config = require('./github_config');

client.publish('out', JSON.stringify({
    channel: github_config.channel,
    message: 'github post commit hook listener online',
}));

app.use(express.bodyParser());

app.post('/', function(req, res) {
    github_json = JSON.parse(req.body.payload)
    
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
	reply = {
	    channel: github_config.channel,
	    message: message,
	};
	console.log(branch + ': ' + commit.author.username);
	client.publish('out', JSON.stringify(reply));
    }
});

app.listen(github_config.port);
