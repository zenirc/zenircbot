import gevent
import json

from irc import IRCBot, run_bot
from gevent import monkey
from services.lib.api import load_config, get_redis_client


monkey.patch_all()
config = load_config('./bot.json')
pub = get_redis_client(config['redis'])


class RelayBot(IRCBot):

    def __init__(self, *args, **kwargs):
        super(RelayBot, self).__init__(*args, **kwargs)
        gevent.spawn(self.do_sub)

    def do_sub(self):
        sub = get_redis_client(config['redis'])
        self.pubsub = sub.pubsub()
        self.pubsub.subscribe('out')
        for msg in self.pubsub.listen():
            message = json.loads(msg['data'])
            print "Got %s" % message
            if message['version'] == 1:
                if message['type'] == 'privmsg':
                    self.respond(message['data']['message'],
                                 channel=message['data']['to'])

    def do_privmsg(self, nick, message, channel):
        to_publish = json.dumps({
            'version': 1,
            'type': 'privmsg',
            'data': {
                'sender': nick,
                'channel': channel,
                'message': message,
                },
            })

        pub.publish('in', to_publish)
        print "Sending to in %s" % to_publish

    def do_part(self, nick, command, channel):
        to_publish = json.dumps({
            'version': 1,
            'type': 'part',
            'data': {
                'sender': nick,
                'channel': channel,
            }
        })
        pub.publish('in', to_publish)
        print "Sending to in %s" % to_publish

    def do_quit(self, command, nick, channel):
        to_publish = json.dumps({
            'version': 1,
            'type': 'quit',
            'data': {
                'sender': nick,
            }
        })
        pub.publish('in', to_publish)
        print "Sending to in %s" % to_publish

    def command_patterns(self):
        return (
            ('/privmsg', self.do_privmsg),
            ('/part', self.do_part),
            ('/quit', self.do_quit),
        )


run_bot(RelayBot, config['servers'][0]['hostname'],
        config['servers'][0]['port'], config['servers'][0]['nick'],
        config['servers'][0]['channels'])
