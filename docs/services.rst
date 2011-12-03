Services
========

Service Model
-------------

ZenIRCBot is a bit unique in how it works. A lot of IRC bots have
plugins and you put the in the plugin directory, they get loaded when
the bot starts. This model has worked pretty well in past for bots,
the down side being you have to either have a really complex system to
be able to dynamically load and unload plugins on the fly, or restart
the bot in order to load new plugins. Also the plugins had to be
written in the same language as the bot or one of the explicitly
supported languages.

This bot on the other hand has no plugins, and adding or removing
functionality has nothing to do with core bot itself. Not just that,
but what you can do with the plugins is only limited by your
imagination as they are their own processes.

When you start bot.js it connects to redis and subscribes to a pub/sub
channel called 'out'. Any messages that come from IRC are published to
'in'. Then when you start a service, if it needs to know/process IRC
messages it subscribes to the 'in' channel. If it wants to interact
with the bot in some fashion, it publishes to the 'out' channel.
Decoupling in this way allows for services to be written in any
language, be running constantly or just as needed.

Writing Your Own
----------------

When writing your own service, the easiest way to do so is to place it
in the ``services`` directory. This way you can use admin.js_ to
start, restart, and stop your service. Also you get access to
``lib/api`` which currently has nodejs and python versions. The things
in ``lib/api`` are mostly convenience functions. The details of what
is in there will be discussed later.

First lets look at the low level protocol. Messages all have the same
envelope::

    {
        version: 1,
        type: '',
        data: {
            ...
        }
    }

The possible in message types and their data objects are as follows:

.. js:data:: 'privmsg'

    data::
        {
            from: '',
            channel: '',
            message: '',
        }


.. note::
    If you port ``lib/api`` to another langauge, please send a
    pull request with it, I'll gladly add it and maintain it to stay
    up to date with any protocol changes.



- admin.js
- github.js
- jira_feed.py
- jira_ticket.js
- release.js
- weblistener.js
