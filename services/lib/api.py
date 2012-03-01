from redis import Redis
import json
from threading import Thread


def send_privmsg(to, message):
    if type(to) == type(''):
        to = (to,)
    else:
        for channel in to:
            Redis().publish('out',
                            json.dumps({
                                'version': 1,
                                'type': 'privmsg',
                                'data': {
                                    'to': channel,
                                    'message': message,
                                }
                            }))


def send_admin_message(message):
    config = load_config('../bot.json')
    send_privmsg(config['servers'][0]['admin_spew_channels'], message)


def non_blocking_redis_subscribe(func, args=[], kwargs={}):
    pubsub = Redis().pubsub()
    pubsub.subscribe('in')
    for msg in pubsub.listen():
        message = json.loads(msg['data'])
        func(message=message, *args, **kwargs)


def register_commands(service, commands):
    send_admin_message(service + ' online!')
    if commands:
        def registration_reply(message, service, commands):
            if message['version'] == 1 and message['type'] == 'privmsg':
                if message['data']['message'] == "commands":
                    for command in commands:
                        send_privmsg(message['data']['sender'],
                                     "%s: %s - %s" % (service,
                                                      command['name'],
                                                      command['description']))
        redis_sub = Thread(target=non_blocking_redis_subscribe,
                           kwargs={'func': registration_reply,
                                   'kwargs': {'service': service,
                                              'commands': commands}})
        redis_sub.start()


def load_config(name):
    with open(name) as f:
        return json.loads(f.read())
