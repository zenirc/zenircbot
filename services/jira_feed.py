from datetime import datetime, timedelta
from time import sleep
import re

from BeautifulSoup import BeautifulSoup
from feedparser import parse
from zenircbot_api import ZenIRCBot, load_config


bot_config = load_config('../bot.json')

zen = ZenIRCBot(bot_config['redis']['host'],
                bot_config['redis']['port'],
                bot_config['redis']['db'])


zen.register_commands('jira_feed.py', [])
jira_config = load_config("./jira.json")
jira_url = '%sbrowse/\\1' % jira_config['jira_url']
latest = None


def strtodt(string):
    return datetime.strptime(string, '%Y-%m-%dT%H:%M:%SZ')


while True:
    feed = parse(jira_config['feed_url'])
    if latest is None:
        latest = strtodt(feed['entries'][0].updated) - timedelta(seconds=1)
    entries = [entry for entry in feed['entries']
               if strtodt(entry.updated) > latest]
    for entry in entries:
        if strtodt(entry.updated) > latest:
            latest = strtodt(entry.updated)
        bs = BeautifulSoup(entry.title)
        message = ''.join(bs.findAll(text=True))
        if not ('created' in message or
                'resolved' in message or
                'reopened' in message):
            continue
        zen.send_privmsg(jira_config['channels'],
                         'JIRA - %s' % re.sub('(?:\s|^)([a-zA-Z][a-zA-Z]-\d+)',
                                              jira_url,
                                              message))

    sleep(jira_config['poll_rate'])
