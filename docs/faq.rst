Frequently Asked Questions
==========================

Can I run 2 bots in one Redis instance?
---------------------------------------

No, even if you specify different database numbers. The issue is that
the pub/sub parts of Redis are shared between all databases in an
instance. Instead you'll have to run a Redis instance and set of
services per bot.
