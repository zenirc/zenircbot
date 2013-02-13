Install
=======

Installing ZenIRCBot will one day be much simpler, but for now there
are a number of steps to it.

To start with, the bot is written in both JavaScript_ using the Node_
platform, and there is a version that is written in Python_. Two of
the services are written in or rely on Python_ the rest are written in
JavaScript.

If you are on Ubuntu, then the quickest and easiert way to get a recent 
version of node is to use a version from a PPA_ (Personal Package Archive).
This PPA containes the latest stable versions of nodejs.

To install from the PPA make sure you have ``python-software-properties`` 
installed first otherwise you might be missing the ``add-apt-repository`` 
command. (Install ``software-properties-common`` on Quantal).

Then run::

    $ sudo add-apt-repository ppa:chris-lea/node.js
    $ sudo apt-get update
    $ sudo apt-get install nodejs npm

If you don't want to use the PPA_ then you can always compile node_ and 
npm_ yourself.


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
have those you'll need to use npm to install the dependencies::

    $ npm install

Then all you need to do is start the bot::

    $ node bot.js

Voilà, your bot should connect, join the channels in the config and go
forth on its merry way. It wont do anything interesting until you
start up services. You can find information on starting up :doc:`services`.

Getting the python bot running
------------------------------

.. warning::

    This version of the bot is less battle tested than the node
    version. This doesn't mean you shouldn't use it, just know that
    these instructions may change in the near future. Also it doesn't
    use all of the options in the ``bot.json``

To start with you'll need to install Python_, virtualenv_, libevent
(libevent-dev if you are on ubuntu) and Redis_ (all three provided by
your OS package manager). Once you have those you'll want to make and
activate the virtualenv to keep your libraries you installed for
ZenIRCBot (if you have virtualenvwrapper installed already feel free
to use it of course)::

    $ virtualenv zib
    $ source zib/bin/activate

Then use pip to install the dependencies::

    $ pip install -r requirements.txt

Then all you need to do is run::

    $ python bot.py

Voilà, your bot should connect, and go forth on its merry way. It wont
do anything interesting until you start up services. You can find
information on starting up :doc:`services`.

Getting the clojure bot running
-------------------------------

.. warning::

    This version of the bot is less battle tested than the node
    version. This doesn't mean you shouldn't use it, just know that
    these instructions may change in the near future. Also it doesn't
    use all of the options in the ``bot.json``

To start with you'll need to install Clojure_, Leiningen_ and
Redis_. Once you have those installed you'll check out the clojure bot
with::

    $ git submodule init
    $ git submodule update

Then you'll start the bot with::

    $ cd clojurebot
    $ lein trampoline run -m zenircbot-clojure.core

Voilà, your bot should connect, join the channels in the config and go
forth on its merry way. It wont do anything interesting until you
start up services. You can find information on starting up :doc:`services`.


.. _JavaScript: http://en.wikipedia.org/wiki/JavaScript
.. _node: http://nodejs.org
.. _Python: http://python.org
.. _npm: http://npmjs.org
.. _Redis: http://redis.io
.. _node-irc: https://github.com/martynsmith/node-irc
.. _virtualenv: http://pypi.python.org/pypi/virtualenv
.. _irckit: https://github.com/coleifer/irc
.. _Clojure: http://clojure.org/
.. _Leiningen: https://github.com/technomancy/leiningen
.. _PPA: https://launchpad.net/~chris-lea/+archive/node.js/
