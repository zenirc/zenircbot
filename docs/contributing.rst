Contributing
============

License
-------

ZenIRCBot is covered by an MIT license, any code contributed will be
required to be covered by this license as well.

Issues
------

The `GitHub issue tracker`_ is the prefered method of reporting an
issue. Please do not apply any tags or milestones, I will do that
myself when I triage the issue.

.. _`GitHub issue tracker`: https://github.com/wraithan/zenircbot/issues

Code
----

If you write code and would like it integrated with the code base
please follow the following steps:

#. Fork the repo_
#. Create a branch in your repo_
#. Do you bug fix/feature add/hackery
#. Send a pull request from that branch
#. Do not delete your fork until the pull request has been accepted or
   declined in such a way that you do not want to continue development
   on it.

.. _repo:  https://github.com/wraithan/zenircbot

Tests
-----

There are some integration tests in the `tests folder`. You will need
to have circus_, and ngIRCd_ installed in order to use them. You run
them like so::

    $ cd tests/
    $ ./test.sh

This will bootstrap an environment that includes an IRC daemon and
redis running on non standard ports. Then it fires up the bot then
runs the tests. So far this works on my systems, please open an issue
if you find that it doesn't work for you.

Do not feel obligated to add tests for services, only if you are
expanding the protocol that the bot itself is away of.

.. _`tests folder`: https://github.com/wraithan/zenircbot/tree/master/tests
.. _circus: https://github.com/mozilla-services/circus
.. _ngIRCd: http://ngircd.barton.de/
