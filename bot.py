import gevent
import redis
import json

from irc import IRCBot, run_bot
from gevent import monkey

monkey.patch_all()

r = redis.StrictRedis(host='localhost', port=6379, db=0)

class RelayBot(IRCBot):

    def __init__(self, *args, **kwargs):
        super(RelayBot, self).__init__(*args, **kwargs)
        gevent.spawn(self.do_sub)

    def do_sub(self):
        r = redis.StrictRedis(host='localhost', port=6379, db=0)
        self.pubsub = r.pubsub()
        self.pubsub.subscribe('out')
        for msg in self.pubsub.listen():
            message = json.loads(msg['data'])
            print "Got %s" % message
            self.respond(message['data']['message'], channel=message['data']['to'])

    def do_pub(self, nick, message, channel):
        to_publish = json.dumps({
            'data': {
                'to': channel,
                'message': message,
            }
        })
        r.publish('in', to_publish)
        print "Sending to in %s" % to_publish

    def command_patterns(self):
        return (
            ('.*', self.do_pub),
        )

host = 'irc.freenode.net'
port = 6667
nick = 'relaybot'

run_bot(RelayBot, host, port, nick, ['#pdxbots'])
