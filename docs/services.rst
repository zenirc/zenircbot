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


Jira Ticket
-----------


Release
-------


Weblistener
-----------
.. _weblistener:
This is a service that passes along post data to the web_in channel in
redis.
