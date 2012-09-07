from redis import StrictRedis
import json
from threading import Thread
import warnings


warnings.warn(
    'lib/api.py is deprecated, please install '
    'zenircbot_api and use that instead',
    DeprecationWarning
)


def send_privmsg(to, message):
    if isinstance(to, basestring):
        to = (to,)
    for channel in to:
        get_redis_client().publish('out',
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
    pubsub = get_redis_client().pubsub()
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


def get_redis_client(redis_config=None):
    if not redis_config:
        redis_config = load_config('../bot.json')['redis']
    return StrictRedis(host=redis_config['host'],
                       port=redis_config['port'],
                       db=redis_config['db'])
