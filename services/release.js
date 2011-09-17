var redis_lib = require('redis');
var pub = redis_lib.createClient();
var sub = redis_lib.createClient();
var color = require('../lib/colors');
var release_config = require('./release_config');

pub.publish('out', JSON.stringify({
    channel: release_config.channel,
    message: 'release broadcaster online',
}));

sub.subscribe('web_in')
sub.on('message', function(channel,message){
    message = JSON.parse(message)
    if (message.app != 'release') {
	return
    }
    release_json = JSON.parse(message.body.payload)


    reply = {
	channel: release_config.channel,
	message: 'release of ' + release_json.branch + ' ' + release_json.status + ' on ' + release_json.hostname,
    }
    pub.publish('out', JSON.stringify(reply));
});
