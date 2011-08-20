from BeautifulSoup import BeautifulSoup
from feedparser import parse
from redis import Redis
from time import sleep
from datetime import datetime, timedelta
import json
import re
import jira_feed_config

latest = None
redis = Redis()

def strtodt(string):
    return datetime.strptime(string, '%Y-%m-%dT%H:%M:%SZ')

while True:

    feed = parse(jira_feed_config.feed_url)
    if latest is None:
        latest = strtodt(feed['entries'][0].updated) - timedelta(seconds=1)
    entries = [entry for entry in feed['entries'] if strtodt(entry.updated) > latest]
    for entry in entries:
        if strtodt(entry.updated) > latest:
            latest = strtodt(entry.updated)
        bs = BeautifulSoup(entry.title)
        message = ''.join(bs.findAll(text=True))
        if not ('created' in message or 'resolved' in message or 'reopened' in message):
            continue
        reply = {
            'channel': jira_feed_config.channel,
            'message': 'JIRA - %s' % re.sub('(\w\w-\d+)', '%sbrowse/\\1'%jira_feed_config.url, message),
            }
        redis.publish('out', json.dumps(reply))

    sleep(jira_feed_config.poll_rate)
