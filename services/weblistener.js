var express = require('express');
var app = express.createServer();
var api = require('./lib/api');
var pub = api.get_redis_client();
var weblistener_config = api.load_config('./weblistener.json');


api.register_commands('weblistener.js', []);

app.use(express.bodyParser());

app.post('/:app', function(req, res) {
    console.log(req.params.app);
    var message = {
        app: req.params.app,
        body: req.body
    };
    pub.publish('web_in', JSON.stringify(message));
    res.send('',404);
});

app.listen(weblistener_config.port);
