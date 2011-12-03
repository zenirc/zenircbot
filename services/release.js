var redis_lib = require('redis');
var sub = redis_lib.createClient();
var api = require('../lib/api');
var release_config = require('./release_config');

api.send_message(release_config.channel,
		 'release broadcaster online');

sub.subscribe('web_in')
sub.on('message', function(channel,message){
    message = JSON.parse(message)
    if (message.app != 'release') {
	return
    }
    release_json = JSON.parse(message.body.payload)


    api.send_message(release_config.channel, 
		     'release of ' + release_json.branch + ' ' + release_json.status + ' on ' + release_json.hostname)
    }
});
