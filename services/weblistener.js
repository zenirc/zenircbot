var express = require('express');
var app = express.createServer();
var redis = require('redis');
var client = redis.createClient();
var color = require('../lib/colors');
var admin_config = require('./weblistener_config');
var weblistener_config = require('./weblistener_config');

client.publish('out', JSON.stringify({
    channel: admin_config.channel,
    message: 'web listener online',
}));


app.use(express.bodyParser());

app.post('/:app', function(req, res) {
    message = {
	app: req.params['app'],
	body: req.body
    };
    client.publish('web_in', JSON.stringify(message));
});

app.listen(weblistener_config.port);
