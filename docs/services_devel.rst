Developing Services
===================

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
        "version": 1,
        "type": "",
        "data": {
            ...
        }
    }

In messages
~~~~~~~~~~~

The possible ``in`` messages.

.. js:data:: "privmsg"

    Sent whenever a privmsg comes in::

        {
            "version": 1,
            "type": "privmsg",
            "data": {
                "sender": "",
                "channel": "",
                "message": ""
            }
        }

.. js:data:: "part"

    Sent whenever someone leaves a channel::

        {
            "version": 1,
            "type": "part",
            "data": {
                "sender": "",
                "channel": ""
            }
        }

.. js:data:: "quit"

    Sent whenever someone quits::

        {
            "version": 1,
            "type": "quit",
            "data": {
                "sender": ""
            }
        }

Out messages
~~~~~~~~~~~~

The possible ``out`` messages.

.. js:data:: "privmsg"

    Used to have the bot say something::

        {
            "version": 1,
            "type": "privmsg",
            "data": {
                "to": "",
                "message": ""
            }
        }


.. js:data:: "raw"

    Used to have the bot send a raw string to the IRC server::

        {
            "version": 1,
            "type": "raw",
            "data": {
                "command": ""
            }
        }


API Library
-----------

.. warning::

    The following API is depreciated, use the `new API libraries`_ instead.

.. _`new API libraries`: http://zenircbot-api.rtfd.org/

These are the functions that can be found in the python and node.js
api library.

.. js:function:: send_privmsg(channel, message)

   :param string channel: The channel to send the message to.
   :param string message: The message to send.

   This is a helper so you don't have to handle the JSON or the
   envelope yourself.

.. js:function:: send_admin_message(message)

   :param string message: The message to send.

   This is a helper function that sends the message to all of the
   channels defined in ``admin_spew_channels``.

.. js:function:: register_commands(script, commands)

   :param string script: The script with extension that you are registering.
   :param list commands: A list of objects with name and description
                         attributes used to reply to a commands query.

   This will notify all ``admin_spew_channels`` of the script coming
   online when the script registers itself. It will also setup a
   subscription to the 'out' channel that listens for 'commands' to be
   sent to the bot and responds with the list of script, command name,
   and command description for all registered scripts.

.. js:function:: load_config(name)

   :param string name: The JSON file to load.
   :returns: An native object with the contents of the JSON file.

   This is a helper so you don't have to do the file IO and JSON
   parsing yourself.

.. note::
    If you port ``zenircbot-api`` to another language, please send a
    pull request with it, I'll gladly add it and maintain it to stay
    up to date with any protocol changes.
