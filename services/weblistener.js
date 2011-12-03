var express = require('express');
var app = express.createServer();
var redis = require('redis');
var client = redis.createClient();
var color = require('../lib/colors');
var admin_config = require('./admin_config');
var weblistener_config = require('./weblistener_config');

api.send_message(admin_config.channel,
		 'web listener online');



app.use(express.bodyParser());

app.post('/:app', function(req, res) {
    console.log(req.params['app']);
    message = {
	app: req.params['app'],
	body: req.body
    };
    client.publish('web_in', JSON.stringify(message));
    res.send('',404)
});

app.listen(weblistener_config.port);
