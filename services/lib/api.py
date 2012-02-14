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

def load_config(name):
    with open(name) as f:
        return json.loads(f.read())
