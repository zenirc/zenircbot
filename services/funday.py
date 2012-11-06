import json
from zenircbot_api import ZenIRCBot, load_config
import requests


bot_config = load_config('../bot.json')
admins = bot_config['servers'][0]['admin_nicks']
zen = ZenIRCBot(bot_config['redis']['host'],
                bot_config['redis']['port'],
                bot_config['redis']['db'])

commands = [
    {
        'name': '!funday',
        'description': 'Gets a random funday monday from fundayroulette.com'
    }
]

# zen.register_commands(__file__, commands)

funday_url = 'http://fundayroulette.com/api/v1/funday/random/?format=json'


def debug(data):
    return
    zen.send_privmsg('#pdxbots', str(data))

sub = zen.get_redis_client().pubsub()
sub.subscribe('in')
for msg in sub.listen():
    debug(msg)
    if msg['type'] == 'subscribe':
        continue
    message = json.loads(msg['data'])
    if message['version'] == 1:
        debug('version==1')
        if message['type'] == 'directed_privmsg':
            debug('directed')
            data = message['data']
            if data['message'] == 'funday':
                debug('funday')
                res = requests.get(funday_url)
                funday = json.loads(res.content)
                zen.send_privmsg(data['channel'],
                                 '%s: %s' % (funday['name'],
                                             funday['description']))
