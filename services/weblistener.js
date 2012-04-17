var api = require('zenircbot-api');
var bot_config = api.load_config('../bot.json');
var zen = new api.ZenIRCBot(bot_config.redis.host,
                            bot_config.redis.port,
                            bot_config.redis.db);
var weblistener_config = api.load_config('./weblistener.json');
var express = require('express');
var app = express.createServer();


api.register_commands('weblistener.js', []);

app.use(express.bodyParser());

app.post('/:app', function(req, res) {
    console.log(req.params.app);
    var message = {
        app: req.params.app,
        body: req.body
    };
    zen.redis.publish('web_in', JSON.stringify(message));
    res.send('',404);
});

app.listen(weblistener_config.port);
