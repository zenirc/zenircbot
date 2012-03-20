Services
========

This is the documentation for the individual services that come with
ZenIRCBot. For all of the `Node.js`_ based services you'll need to
have the node `redis`_ library installed. For the `Python`_ based
services you'll need to need to have the python `redis`_ library
installed::

    $ npm install redis # for Node

    $ pip install redis # for Python


Admin
-----

.. _admin:

This is a service for doing basic things like starting and stopping
other services or restarting the bot. It is written in `Node.js`_ and
also relies on `forever`_::

    $ npm install forever

Config
~~~~~~

The config is very simple, a single option called ``services`` which
is a list of services you want started when you start ``admin.js``

Commands
~~~~~~~~
start <service name>
    This will start the specified service.

restart <service name>
    This will restart the specific service.

stop <service name>
    This will restart the specific service.

pull
    This will pull down new code.

Github
------

.. _github:

This service relies on the weblistener_ service to pass along the post
body with the service set in the JSON envelope. It is written in `Node.js`_

Jira Feed
---------

.. _jira_feed:

This service does a check on the specified JIRA issue RSS feed and
posts to the channel whenever an issue is created, closed, or
reopened. It is written in `Python`_.

Jira Ticket
-----------

.. _jira_ticket:

This service watches for something formated with 2 letters, a dash,
then numbers. For example BH-1234, it takes that, and appends it to
the specified JIRA URL and says it back to the channel so you get
links to issues automatically. It is written in `Node.js`_.

Release
-------

.. _release:

This service is akin to the github_ service in that it relies on the
weblistener_ service to send it data when something is posted to the
port on the machine running the weblistener_ service. The post body
should look like::


    payload: "{
        branch: 'feature/cool_stuff',
        status: 'started',
        hostname: 'staging-04',
    }"

Where payload is the post variable, and what it contains is a JSON
string with the attributes branch, status, and hostname. And it will
then emit something like::

    release of feature/cool_stuff started on staging-04

To the channel specified in the config. It is written in `Node.js`_.

Semantics
---------

.. _semantics:

This service adds another message type that is sent out over `in`
which is the `directed_privmsg` type. These are messages that have
been determined to have been sent to the bot via the following two
forms::

    ZenIRCBot: commands
    !commands

It will also grab messages that were sent directly to the bot via a
PM. It sends the standard envelope like the `privmsg` type. Its `data`
attribute is slightly different though::

    "data": {
        "raw_message": "!commands",
        "message": "commands",
        "sender": "Wraithan",
        "channel": "#pdxbots"
    }

It strips the the way it was determined to be addressed to the bot so
you can listen specifically for commands to come through rather than
having to check all possible methods for a person to send a direct
message. It is written in `Node.js`_.

Troll
-----

.. _troll:

This service is a basic trolling service. It is written in `Node.js`_.

Commands
~~~~~~~~

ls
    Responds with a funny picture.
irssi
    Responds with a suggestion to use weechat.

TWSRS
-----
That's What She Really Said
~~~~~~~~~~~~~~~~~~~~~~~~~~~

This is a service inspired by `talkbackbot`_ and steals its quote DB
which it got a lot of from this `quote source`_.

Commands
~~~~~~~~

That's what she said
    Responds with a quote from a famous woman when this is said in a
    channel.
twsrs
    This is an actual command and allows one to get quotes without
    having to say that's what she said.

Weblistener
-----------

.. _weblistener:

This is a service that passes along post data to the `web_in` channel in
redis in the format of::

    body: {
        payload: "JSON String",
        app: 'whatever-path-on-the-url-posted-to',
    }

Where payload is the POST body and app is
http://example.com/whatever-path-on-the-url-posted-to for example. It
is written in `Node.js`_ and also relies on having `express`_
installed::

    $ npm install express

.. _`Node.js`: http://nodejs.com/
.. _`Python`: http://python.org/
.. _`redis`: http://redis.io/
.. _`forever`: https://github.com/nodejitsu/forever
.. _`express`: http://expressjs.com/
.. _`talkbackbot`: https://github.com/jessamynsmith/talkbackbot
.. _`quote source`: http://womenshistory.about.com/library/qu/blqulist.htm
