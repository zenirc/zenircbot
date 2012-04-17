import random
import json
from zenircbot_api import ZenIRCBot, load_config


bot_config = load_config('../bot.json')

zen = ZenIRCBot(bot_config['redis']['host'],
                bot_config['redis']['port'],
                bot_config['redis']['db'])


zen.register_commands('twsrs.py', [{'name': 'that\'s what she said',
                                    'description': 'Replies to "That\'s what she said" with quotes from famous women'}])

quote_list = open('twsrs_quotes.txt').readlines()

def get_quote():
    """get_quote"""
    index = random.randint(0, len(quote_list) - 1)
    quote = quote_list[index].strip()
    return quote


sub = zen.get_redis_client().pubsub()
sub.subscribe('in')
for msg in sub.listen():
    message = json.loads(msg['data'])
    if message['version'] == 1:
        if message['type'] == 'privmsg':
            text = message['data']['message']
            text = text.encode('ascii', 'ignore').lower().translate(None,
                                                                    """`~!@#$%^&*()_-+={}[];:'"<>,.?/""")
            if text.startswith('thats what she said'):
                zen.send_privmsg(message['data']['channel'], get_quote())
        elif message['type'] == 'directed_privmsg':
            if message['data']['message'] == 'twsrs':
                zen.send_privmsg(message['data']['channel'], get_quote())
