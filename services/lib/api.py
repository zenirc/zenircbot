from redis import Redis
import json
from threading import Thread

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

def non_blocking_reply(service, commands):
    pubsub = Redis().pubsub()
    pubsub.subscribe('in')
    for msg in pubsub.listen():
        message = json.loads(msg['data'])
        if message['version'] == 1 and message['type'] == 'privmsg':
            if message['data']['message'] == "commands":
                for command in commands:
                    send_privmsg(message['data']['sender'], "%s: %s - %s" % (service, command['name'], command['description']))

def register_commands(service, commands):
    meh = Thread(target=non_blocking_reply, kwargs={'service': service, 'commands': commands})
    meh.start()

def load_config(name):
    with open(name) as f:
        return json.loads(f.read())
