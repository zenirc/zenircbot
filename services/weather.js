var api = require('zenircbot-api');
var zen = new api.ZenIRCBot();
var sub = zen.get_redis_client();
var weather = require('googleweather');

zen.register_commands("weather.js",
    [{name: "!weather <location>",
      description: "fetches weather for a given location from Google."
    }]);

var weather_config = api.load_config('./weather.json');
var default_location =  weather_config.location || null;

sub.subscribe('in');
sub.on('message', function(channel, message) {
    var msg = JSON.parse(message);
    var sender = msg.data.sender;
    if (msg.version == 1) {
        if (msg.type == "directed_privmsg") {
            var match = /weather(?:\s(.+))?/i.exec(msg.data.message);
            if (match.length > 0) {
                var location = match[1] || default_location;
                if (location) {
                    var current_date = new Date().toDateString();
                    weather.get(function(w) {
                        weather_msg = "Current Weather: " + w.condition +
                                ", Temperature: " + w.temperature + "ºC" +
                                ", Humidity: " + w.humidity + "%" +
                                ", Wind: " + w.wind.direction +
                                " " + w.wind.speed + "KPH";

                        zen.send_privmsg(msg.data.channel,
                                        sender + ': ' + weather_msg);
                    }, location, current_date);
                }
            }
        }
    }
});
