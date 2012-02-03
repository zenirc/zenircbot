Services
========

This is the documentation for the individual services that come with
ZenIRCBot. 


Admin
-----

.. _admin:

This is a service for doing basic things like starting and stopping
other services or restarting the bot. It is written in `Node.js`_.

.. _`Node.js`: http://nodejs.com/

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
body with the service set in the JSON envelope.

Jira Feed
---------

.. _jira_feed:

This service does a check on the specified JIRA issue RSS feed and
posts to the channel whenever an issue is created, closed, or
reopened.

Jira Ticket
-----------

.. _jira_ticket:

This service watches for something formated with 2 letters, a dash,
then numbers. For example BH-1234, it takes that, and appends it to
the specified JIRA URL and says it back to the channel so you get
links to issues automatically.

Ls
--

.. _ls:

This service was started as a basic troll and has grown since then, in
a future release it is very likely that it will be renamed and made
more modular as it keeps getting more trolling stuff added to it.

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

To the channel specified in the config.

Weblistener
-----------

.. _weblistener:

This is a service that passes along post data to the web_in channel in
redis.

Weechat
-------

.. _weechat:

This service will be folded into the ls_ service in the near
future. It is yet another trolling service.
