from redis import Redis
import json


def send_privmsg(to, message):
    Redis().publish('out',
                    json.dumps({
                'version': 1,
                'type': 'privmsg',
                'data': {
                    'to': to,
                    'message': message,
                    }
                }))
