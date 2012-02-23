Install
=======

Installing ZenIRCBot will one day be much simpler, but for now there
are a number of steps to it.

To start with, the bot is written in both JavaScript_ using the Node_
platform, and there is a version that is written in Python_. Two of
the services are written in or rely on Python_ the rest are written in
JavaScript.

If you are on Ubuntu, you should probably build and install Node_ and
npm_ yourself. The packages that provide binaries of each of these
names are not the things that you want. apt-get install node gives you
an amateur packet radio program and npm is provided by a magnetic
resonence imaging program. Neither of which are what ZenIRCBot needs.

Configuring the bot
-------------------

The config for the bot can be found in `bot.json` which is a JSON file
that both the Node.js and Python bots use.

If you don't have a `bot.json`, copy `bot.json.dist` into its place
like so::

    $ cp bot.json{.dist,}

Then modify it and fill in the values with your own.

.. note:: Despite the option being `servers` ZenIRCBot currently only
          supports 1 server. It is named as such for future
          compatibility

Getting the node.js bot running
-------------------------------

To start with you'll need to install Node_, npm_ and Redis_. Once you
have those you'll need to use npm to install the node library for
redis::

    $ npm install redis

You'll also need node-irc_ which is installable via npm as well::

    $ npm install irc

If you want to use the admin service for starting/stopping/restarting
the bot and the services you'll also need to install Python_,
virtualenv_, and tmux_. Create a virtualenv and install Fabric_ in
it (if you have virtualenvwrapper installed already feel free to use
it of course)::

    $ virtualenv zib
    $ source zib/bin/activate
    $ pip install fabric

Once you've done that, if you setup Python/virtualenv/tmux you can
run::

    $ fab zenircbot start

Otherwise you'll just run::

    $ node bot.js

Viola, your bot should connect, join the channels in the config and go
forth on its merry way. It wont do anything interesting until you
start up services. You can find information on starting up :doc:`services`.

Getting the python bot running
------------------------------

.. warning::

    This version of the bot is less battle tested than the node
    version. This doesn't mean you shouldn't use it, just know that
    these instructions may change in the near future.

To start with you'll need to install Python_, virtualenv_ and Redis_
(all three provided by your OS package manager). Once you have those
you'll need to use pip to install the python library for redis as well
as using virtualenv to keep your libraries you installed for ZenIRCBot
(if you have virtualenvwrapper installed already feel free to use it
of course)::

    $ virtualenv zib
    $ source zib/bin/activate
    $ pip install redis

You'll also need irckit_ which is installable via pip as well::

    $ pip install irckit

If you want to use the admin service for starting/stopping/restarting
the bot and the services you'll need to install Fabric_ and tmux_
(provided by your OS package manager) in it::

    $ pip install fabric

In order to configure the bot at this time you have to edit the
`bot.py` and change the values at the bottom of the file. This will be
changed in the near future when the config files are all refactored
into pure JSON files.

Once you're done configuring the bot::

    $ python bot.py

Viola, your bot should connect, and go forth on its merry way. It wont
do anything interesting until you start up services. You can find
information on starting up :doc:`services`.

Getting the clojure bot running
-------------------------------

To start with you'll need to install Clojure_, Leiningen_ and
Redis_. Once you have those installed you'll check out the clojure bot
with::

    $ git submodule init
    $ git submodule update

Then you'll start the bot with::

    $ cd clojurebot
    $ lein trampoline run -m zenircbot-clojure.core

If you want to use the admin service for starting/stopping/restarting
the services you'll also need to install Python_, virtualenv_, and
tmux_. Create a virtualenv and install Fabric_ in it (if you have
virtualenvwrapper installed already feel free to use it of course)::

    $ virtualenv zib
    $ source zib/bin/activate
    $ pip install fabric

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
.. _irckit: https://github.com/coleifer/irc
.. _Clojure: http://clojure.org/
.. _Leiningen: https://github.com/technomancy/leiningen
