var redis_lib = require('redis');
var redis = redis_lib.createClient();
var sub = redis_lib.createClient();
var api = require('./lib/api');


sub.subscribe('in');
sub.on('message', function(channel, message){
    msg = JSON.parse(message)
    if (msg.version == 1 && msg.type == 'topic') {
	redis.set(msg.data.channel+':topic', msg.data.topic)
    } else if (msg.version == 1 && msg.type == 'privmsg') {
	if (/^migration\+\+$/.test(msg.data.message)) {
	    redis.get(msg.data.channel+':topic', function(err, reply) {
		parsed_topic = parse(reply)
		migration_number = parseInt(parsed_topic['Next available migration'])
		parsed_topic['Next available migration'] = migration_number + 1
		api.send_privmsg(msg.data.channel, 
				 msg.data.sender + ': Your migration number is: ' + migration_number);
		api.set_topic(msg.data.channel,
			      stringify(parsed_topic));
	    });
	}
    }
});

function stringify(topic_object) {
    new_topic = ""
    for (var key in topic_object) {
	if (typeof(topic_object[key]) === "object") {
	    new_topic += key + ": {";
	    for (var key2 in topic_object[key]) {
		new_topic += key2 + ": " + topic_object[key][key2] + ", "
	    }
	    new_topic = new_topic.substr(0, new_topic.length-2) + "} || ";
	} else {
	    new_topic += key + ": " + topic_object[key] + " || "}
    }
    
    new_topic = new_topic.substr(0, new_topic.length-4)
    return new_topic
}

function parse(topic) {
    var bars = / || /g;
    var open_squiggle = /: {/g;
    var close_squiggle = /}/g;
    var colon = /: /g;
    topic = topic.replace(/, /g, "\", \"");
    topic = topic.replace(/ \|\| /g, "\", \"");
    topic = topic.replace(/: /g, "\": \"");
    topic = topic.replace(/"\{/g, "\{\"");
    topic = topic.replace(/\}"/g, "\"}");
    topic = "{\"" + topic + "\"}";
    return JSON.parse(topic)
}

