var express = require('express');
var app = express.createServer();
var redis = require('redis');
var client = redis.createClient();
var color = require('./colors');
var github_config = require('./github_config');

app.use(express.bodyParser());

app.post('/', function(req, res) {
    github_json = JSON.parse(req.body.payload)
    
    branch = github_json.ref.substr(11);
    repo = github_json.repository.name;
    name = '';
    username = '';
    for (var i=0; i< github_json.commits.length; i++) {
	commit = github_json.commits[i];
	if (commit.author.username) {
	    username = commit.author.username;
	    name = commit.author.name;
	}
	message = repo + ': ' + commit.id.substr(0,7) + ' *' + color.green + branch + color.reset +'* ' + commit.message + ' - ' + username + ' (' + name + ')';
	reply = {
	    channel: github_config.channel,
	    message: message,
	};
	console.log(branch + ': ' + username);
	client.publish('out', JSON.stringify(reply));
    }
});

app.listen(github_config.port);
