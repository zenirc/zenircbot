Install
=======

Installing ZenIRCBot will one day be much simpler, but for now there
are a number of steps to it.

To start with, the bot is written in JavaScript_ using the Node_
platform. Two of the services are written in or rely on Python_ the
rest are written in JavaScript.

Getting the bot running
-----------------------

To start with you'll need to install Node_, npm_ and Redis_. Once you
have those you'll need to use npm to install the node library for
redis::

    npm install redis

You'll also need node-irc_ which is installable via npm as well::

    npm install irc

If you want to use the admin service for starting/stopping/restarting
the bot and the services you'll also need to install Python_,
virtualenv_, and tmux_. Create a virtualenv and install Fabric_ in
it (if you have virtualenvwrapper installed already feel free to use
it of course)::

    virtualenv zib
    source zib/bin/activate
    pip install fabric

Once you've done that it is on to configuring the bot. All of the
configs have examples provided in the form of .dist files. The first
one that will concern us is config.js in the root::

    cp config.js.dist config.js

Edit config.js and customize it to what you need.

Once you've done that, if you setup Python/virtualenv/tmux you can
run::

    fab zenircbot start

Otherwise you'll just run::

    node bot.js

Viola, your bot should connect, join the channels in the config and go
forth on its merry way. It wont do anything interesting until you
start up services. You can find information on starting up :doc:`services`.

.. _JavaScript: http://en.wikipedia.org/wiki/JavaScript
.. _node: http://nodejs.org
.. _Python: http://python.org
.. _npm: http://npmjs.org
.. _Redis: http://redis.io
.. _node-irc: https://github.com/martynsmith/node-irc
.. _virtualenv: http://pypi.python.org/pypi/virtualenv
.. _tmux: http://tmux.sourceforge.net/
.. _Fabric: http://fabfile.org/
