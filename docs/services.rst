Services
========

This is the documentation for the individual services that come with
ZenIRCBot. 


Admin
-----

.. _admin:

This is a service for doing basic things like starting and stopping
other services or restarting the bot. It is written in `Node.js`_.

Commands
~~~~~~~~
restart
    This restarts the bot.

restart <service name>
    This will restart a specific service.

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

Troll
--

.. _troll:

This service is a basic trolling service. It is written in `Node.js`_.

Commands
~~~~~~~~

ls
    Responds with a funny picture.
irssi
    Responds with a suggestion to use weechat.

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
http://example.com/whatever-path-on-the-url-posted-to for example.

.. _`Node.js`: http://nodejs.com/
.. _`Python`: http://python.org/
