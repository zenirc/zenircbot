import random
import json
from lib import api


api.register_commands('twsrs.py', [{'name': 'that\'s what she said',
                                    'description': 'Replies to "That\'s what she said" with quotes from famous women'}])

quote_list = open('twsrs_quotes.txt').readlines()

def get_quote():
    index = random.randint(0, len(quote_list) - 1)
    quote = quote_list[index].strip()
    return quote


sub = api.get_redis_client().pubsub()
sub.subscribe('in')
for msg in sub.listen():
    message = json.loads(msg['data'])
    if message['version'] == 1:
        if message['type'] == 'privmsg':
            text = message['data']['message']
            text = str(text).lower().translate(None, """`~!@#$%^&*()_-+={}[];:'"<>,.?/""")
            if text.startswith('thats what she said'):
                api.send_privmsg(message['data']['channel'], get_quote())
        elif message['type'] == 'directed_privmsg':
            if message['data']['message'] == 'twsrs':
                api.send_privmsg(message['data']['channel'], get_quote())
