var api = require('./lib/api');
var sub = api.get_redis_client();
var release_config = api.load_config('./release.json');


api.register_commands('release.js', []);

sub.subscribe('web_in');
sub.on('message', function(channel,message){
    message = JSON.parse(message);
    if (message.app != 'release') {
        return null;
    }
    var release_json = JSON.parse(message.body.payload);
    api.send_privmsg(release_config.channel,
                     'release of ' + release_json.branch +
                     ' ' + release_json.status +
                     ' on ' + release_json.hostname);

});
