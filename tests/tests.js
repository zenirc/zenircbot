var irc = require('irc');
var redis = require('redis')

var botName = 'WraithTest';
var bot = null;

function getRedisClient() {
    var client = redis.createClient('46379');
    client.subscribe('in');
    return client
}

exports.protocol = {
    setUp: function(callback) {
        this.redis = getRedisClient();
        if (!bot) {
            bot = new irc.Client('localhost',
                                  botName,
                                  {
                                      'port': 46667,
                                      'channels': ['#pdxbots', '##pdxbots']
                                   });
            bot.addListener('join', function(channel, nick) {
                if (channel === '##pdxbots' && nick === botName){
                    callback();
                }
            })
            bot.addListener('error', function(message) {
                    console.log(message);
            });
        } else {
            setTimeout(function() {
                callback();
            }, 500);
        }
    },
    tearDown: function(callback) {
        this.redis.quit();
        callback();
    },
    testUnofficialChannel: function(test) {
        test.expect(6);
        var msgSent = 'ohai';
        var testChannel = '##pdxbots';
        var timer = setTimeout(function() {
            console.log('timeout');
            test.done();
        }, 1000);
        this.redis.on('message', function(channel, message) {
            var msg = JSON.parse(message);
            validate_message(test, msg, testChannel, msgSent);
            clearTimeout(timer);
            test.done();
        });
        bot.say(testChannel, msgSent);
    },
    testOfficialChannel: function(test) {
        test.expect(6);
        var msgSent = 'ohai';
        var testChannel = '#pdxbots';
        var timer = setTimeout(function() {
            console.log('timeout');
            test.done();
        }, 1000);
        this.redis.on('message', function(channel, message) {
            var msg = JSON.parse(message);
            validate_message(test, msg, testChannel, msgSent);
            clearTimeout(timer);
            test.done();
        });
        bot.say(testChannel, msgSent);
    },
    testPM: function(test) {
        test.expect(6);
        var msgSent = 'ohai';
        var timer = setTimeout(function() {
            console.log('timeout');
            test.done();
        }, 1000);
        this.redis.on('message', function(channel, message) {
            var msg = JSON.parse(message);
            validate_message(test, msg, botName, msgSent);
            clearTimeout(timer);
            test.done();
        });
        bot.say('ZenIRCBot', msgSent);
    },
    // testJoin: function(test) {
    //     test.expect(1);
    //     test.ok(false);
    //     test.done();
    // },
    // testPart: function(test) {
    //     test.expect(1);
    //     test.ok(false);
    //     test.done();
    // },
    // testQuit: function(test) {
    //     test.expect(1);
    //     test.ok(false);
    //     test.done();
    // }
};

function validate_message(test, message, testChannel, msgSent) {
    test.equal(message.version, 1);
    test.equal(message.type, 'privmsg');
    test.ok(message.data);
    test.equal(message.data.message, msgSent);
    test.equal(message.data.sender, botName);
    test.equal(message.data.channel, testChannel);
}
