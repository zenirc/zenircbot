var express = require('express');
var app = express.createServer();
var redis = require('redis');
var client = redis.createClient();
var api = require('./lib/api');
var admin_config = api.load_config('./admin.json');
var weblistener_config = api.load_config('./weblistener.json');

api.send_privmsg(admin_config.channel,
		 'web listener online');

app.use(express.bodyParser());

app.post('/:app', function(req, res) {
    console.log(req.params['app']);
    message = {
	app: req.params['app'],
	body: req.body
    };
    client.publish('web_in', JSON.stringify(message));
    res.send('',404);
});

app.listen(weblistener_config.port);
